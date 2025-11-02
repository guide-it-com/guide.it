#import <React/RCTBridgeModule.h>
#import <React/RCTUtils.h>
#import <AVFoundation/AVFoundation.h>
#import "tts.h"

// Forward declaration
@class SpeechDelegate;

// Static variable to track current delegate (accessible by both SpeechDelegate and TtsModule)
static SpeechDelegate *currentDelegate = nil;
static NSObject *delegateLock = nil;

// Helper delegate class to handle speech completion
@interface SpeechDelegate : NSObject <AVSpeechSynthesizerDelegate>
@property (nonatomic, copy) RCTPromiseResolveBlock resolve;
@property (nonatomic, assign) BOOL resolved;
@property (nonatomic, strong) AVSpeechUtterance *trackedUtterance;
- (instancetype)initWithResolve:(RCTPromiseResolveBlock)resolve;
@end

@implementation SpeechDelegate

- (instancetype)initWithResolve:(RCTPromiseResolveBlock)resolve {
    self = [super init];
    if (self) {
        _resolve = resolve;
        _resolved = NO;
        _trackedUtterance = nil;
    }
    return self;
}

- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer didFinishSpeechUtterance:(AVSpeechUtterance *)utterance {
    // Ensure we're handling the correct utterance and delegate
    BOOL shouldResolve = NO;
    RCTPromiseResolveBlock resolveBlock = nil;
    
    @synchronized(delegateLock) {
        // Only act if this utterance belongs to us and we're still the current delegate
        if (self == currentDelegate && !self.resolved && utterance == self.trackedUtterance) {
            shouldResolve = YES;
            self.resolved = YES;
            resolveBlock = self.resolve;
            self.resolve = nil;
            self.trackedUtterance = nil;
            
            if (currentDelegate == self) {
                synthesizer.delegate = nil;
                currentDelegate = nil;
            }
        }
    }
    
    // Resolve on main thread if needed
    if (shouldResolve && resolveBlock) {
        dispatch_async(dispatch_get_main_queue(), ^{
            resolveBlock(@"done");
        });
    }
}

- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer didCancelSpeechUtterance:(AVSpeechUtterance *)utterance {
    // Ensure we're handling the correct utterance and delegate
    BOOL shouldResolve = NO;
    RCTPromiseResolveBlock resolveBlock = nil;
    
    @synchronized(delegateLock) {
        // Only act if this utterance belongs to us and we're still the current delegate
        if (self == currentDelegate && !self.resolved && utterance == self.trackedUtterance) {
            shouldResolve = YES;
            self.resolved = YES;
            resolveBlock = self.resolve;
            self.resolve = nil;
            self.trackedUtterance = nil;
            
            if (currentDelegate == self) {
                synthesizer.delegate = nil;
                currentDelegate = nil;
            }
        }
    }
    
    // Resolve on main thread if needed
    if (shouldResolve && resolveBlock) {
        dispatch_async(dispatch_get_main_queue(), ^{
            resolveBlock(@"stopped");
        });
    }
}

- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer didContinueSpeechUtterance:(AVSpeechUtterance *)utterance {
    // Speech continued
}

- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer didPauseSpeechUtterance:(AVSpeechUtterance *)utterance {
    // Speech paused
}

- (void)speechSynthesizer:(AVSpeechSynthesizer *)synthesizer didStartSpeechUtterance:(AVSpeechUtterance *)utterance {
    // Speech started
}

@end

@implementation TtsModule

RCT_EXPORT_MODULE(TtsModule);

// Store the current synthesizer instance
static AVSpeechSynthesizer *synthesizer = nil;
static NSString *currentLanguage = @"en-US";
static NSString *currentVoiceIdentifier = nil;

+ (void)initialize {
    if (self == [TtsModule class]) {
        synthesizer = [[AVSpeechSynthesizer alloc] init];
        delegateLock = [[NSObject alloc] init];
    }
}

// List available languages
RCT_EXPORT_METHOD(listLanguages:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSMutableSet<NSString *> *languages = [NSMutableSet set];
    NSArray<AVSpeechSynthesisVoice *> *voices = [AVSpeechSynthesisVoice speechVoices];
    
    for (AVSpeechSynthesisVoice *voice in voices) {
        if (voice.language) {
            [languages addObject:voice.language];
        }
    }
    
    NSArray<NSString *> *sortedLanguages = [[languages allObjects] sortedArrayUsingSelector:@selector(compare:)];
    NSMutableArray<NSDictionary *> *result = [NSMutableArray array];
    
    for (NSString *lang in sortedLanguages) {
        [result addObject:@{@"id": lang, @"name": lang}];
    }
    
    resolve(result);
}

// Set the language
RCT_EXPORT_METHOD(setLanguage:(NSString *)languageId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    // Validate language
    NSArray<AVSpeechSynthesisVoice *> *voices = [AVSpeechSynthesisVoice speechVoices];
    BOOL isValid = NO;
    
    for (AVSpeechSynthesisVoice *voice in voices) {
        if ([voice.language isEqualToString:languageId]) {
            isValid = YES;
            break;
        }
    }
    
    if (!isValid) {
        reject(@"INVALID_LANGUAGE", [NSString stringWithFormat:@"Language '%@' is not available", languageId], nil);
        return;
    }
    
    currentLanguage = languageId;
    currentVoiceIdentifier = nil; // Reset voice when language changes
    
    resolve(nil);
}

// List available voices
RCT_EXPORT_METHOD(listVoices:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    NSArray<AVSpeechSynthesisVoice *> *voices = [AVSpeechSynthesisVoice speechVoices];
    NSMutableArray<NSDictionary *> *result = [NSMutableArray array];
    
    for (AVSpeechSynthesisVoice *voice in voices) {
        [result addObject:@{
            @"id": voice.identifier ?: @"",
            @"languageId": voice.language ?: @"",
            @"name": voice.name ?: @""
        }];
    }
    
    resolve(result);
}

// Set the voice
RCT_EXPORT_METHOD(setVoice:(NSString *)voiceId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    // Validate voice
    NSArray<AVSpeechSynthesisVoice *> *voices = [AVSpeechSynthesisVoice speechVoices];
    BOOL isValid = NO;
    NSString *voiceLanguage = nil;
    
    for (AVSpeechSynthesisVoice *voice in voices) {
        if ([voice.identifier isEqualToString:voiceId]) {
            isValid = YES;
            voiceLanguage = voice.language;
            break;
        }
    }
    
    if (!isValid) {
        reject(@"INVALID_VOICE", [NSString stringWithFormat:@"Voice '%@' is not available", voiceId], nil);
        return;
    }
    
    currentVoiceIdentifier = voiceId;
    if (voiceLanguage) {
        currentLanguage = voiceLanguage;
    }
    
    resolve(nil);
}

// Speak the message
RCT_EXPORT_METHOD(speak:(NSString *)message
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    if (!message || [message length] == 0) {
        reject(@"INVALID_MESSAGE", @"Message cannot be empty", nil);
        return;
    }
    
    // Stop any current speech and clean up previous delegate
    if ([synthesizer isSpeaking]) {
        // Capture the old delegate and its resolve block with synchronization
        SpeechDelegate *oldDelegate = nil;
        RCTPromiseResolveBlock oldResolve = nil;
        
        @synchronized(delegateLock) {
            oldDelegate = currentDelegate;
            
            if (oldDelegate && !oldDelegate.resolved) {
                oldResolve = oldDelegate.resolve;
                oldDelegate.resolve = nil; // Clear it so delegate callbacks can't use it
                oldDelegate.resolved = YES; // Mark as resolved
                oldDelegate.trackedUtterance = nil; // Clear tracked utterance
            }
            
            // Clear delegate BEFORE stopping to prevent callbacks from affecting new delegate
            synthesizer.delegate = nil;
            currentDelegate = nil;
        }
        
        // Stop the current speech
        [synthesizer stopSpeakingAtBoundary:AVSpeechBoundaryImmediate];
        
        // Resolve the old promise after clearing delegate (on main thread)
        if (oldResolve) {
            dispatch_async(dispatch_get_main_queue(), ^{
                oldResolve(@"stopped");
            });
        }
    }
    
    // Create speech utterance
    AVSpeechUtterance *utterance = [[AVSpeechUtterance alloc] initWithString:message];
    
    // Set language
    if (currentLanguage) {
        utterance.voice = [AVSpeechSynthesisVoice voiceWithLanguage:currentLanguage];
    }
    
    // Set specific voice if selected
    if (currentVoiceIdentifier) {
        AVSpeechSynthesisVoice *voice = [AVSpeechSynthesisVoice voiceWithIdentifier:currentVoiceIdentifier];
        if (voice) {
            utterance.voice = voice;
        }
    }
    
    // Default rate and pitch
    utterance.rate = AVSpeechUtteranceDefaultSpeechRate;
    utterance.pitchMultiplier = 1.0;
    
    // Create a promise resolver to handle completion
    RCTPromiseResolveBlock completionResolve = resolve;
    
    // Set up delegate to handle completion (after old delegate is cleared)
    @synchronized(delegateLock) {
        currentDelegate = [[SpeechDelegate alloc] initWithResolve:completionResolve];
        currentDelegate.trackedUtterance = utterance; // Track this specific utterance
        synthesizer.delegate = currentDelegate;
    }
    
    // Start speaking
    [synthesizer speakUtterance:utterance];
}

// Stop speaking
RCT_EXPORT_METHOD(stop:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    BOOL wasSpeaking = [synthesizer isSpeaking];
    
    if (wasSpeaking) {
        // Resolve any pending promise from current speech
        if (currentDelegate && !currentDelegate.resolved) {
            if (currentDelegate.resolve) {
                currentDelegate.resolve(@"stopped");
            }
        }
        synthesizer.delegate = nil;
        currentDelegate = nil;
        [synthesizer stopSpeakingAtBoundary:AVSpeechBoundaryImmediate];
    }
    
    resolve(@(wasSpeaking));
}

@end
