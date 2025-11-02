Pod::Spec.new do |s|
  s.name            = "tts"
  s.version         = "1.0.0"
  s.summary         = "Text-to-speech module for macOS using AVSpeechSynthesizer"
  s.description     = "Native macOS text-to-speech implementation using AVSpeechSynthesizer for React Native"
  s.homepage        = "https://github.com/guide-it/guide-it"
  s.license         = "MIT"
  s.author          = "guide.it"
  s.platforms       = min_supported_versions
  s.source          = { :path => "." }

  s.source_files    = "**/*.{h,m,mm,swift}"
  s.osx.framework = ["AppKit", "CoreGraphics", "AVFoundation"]

  install_modules_dependencies(s)
end