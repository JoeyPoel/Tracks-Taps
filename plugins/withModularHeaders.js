const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin: enables modular headers for GoogleUtilities and RecaptchaInterop.
 *
 * AppCheckCore is a Swift pod (pulled in by GoogleSignIn) that depends on these two
 * pods. CocoaPods requires them to expose module maps when building as static libraries,
 * otherwise pod install fails with a "cannot integrate as static libraries" error.
 *
 * @param {import('@expo/config-plugins').ExpoConfig} config
 * @returns {import('@expo/config-plugins').ExpoConfig}
 */
const withModularHeaders = (config) => {
    return withDangerousMod(config, [
        'ios',
        async (config) => {
            const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
            let contents = fs.readFileSync(podfilePath, 'utf8');

            const marker = "pod 'GoogleUtilities', :modular_headers => true";
            if (!contents.includes(marker)) {
                // Insert immediately after `use_expo_modules!` inside the target block
                const injection =
                    "  pod 'GoogleUtilities', :modular_headers => true\n" +
                    "  pod 'RecaptchaInterop', :modular_headers => true";

                contents = contents.replace(
                    'use_expo_modules!',
                    `use_expo_modules!\n${injection}`
                );
                fs.writeFileSync(podfilePath, contents);
            }

            return config;
        },
    ]);
};

module.exports = withModularHeaders;
