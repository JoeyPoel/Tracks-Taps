/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "watch",
  name: "Tracks & Taps",
  identifier: "com.joeypoel.trackstaps.watch",
  deploymentTarget: "10.0",
  icon: "../../assets/images/AppIconColouredDarkTheme.png",
  entitlements: {
    "com.apple.security.application-groups": [
      "group.com.joeypoel.trackstaps"
    ]
  }
});
