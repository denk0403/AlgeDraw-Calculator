import icon from "./icon-light.png"

function mySettings(props) {
  return (
    <Page>
      <TextImageRow
        label="AlgeDraw Calculator"
        icon={icon}
      />
      <Section title={<Text bold align="center">App Settings ⌚️</Text>}>
        <Toggle
          settingsKey="toggleVibrations"
          label={`In-App Vibrations: ${props.settings.toggleVibrations === 'true' ? 'On' : 'Off'}`}
        />
      </Section>
      <Section title={<Text bold align="center">Tutorials 📄</Text>}>
        <Link source="https://denk0403.github.io/algedraw%20calculator/drawing.html">
          <Text align="center">• How To Draw Each Digit ✏️</Text>
        </Link>
        <Link source="https://denk0403.github.io/algedraw%20calculator/radiansdegrees.html">
          <Text align="center">• Switching Between Degrees And Radians 🔄</Text>
        </Link>
        <Link source="https://denk0403.github.io/algedraw%20calculator/constants.html">
          <Text align="center">• Using Mathematical Constants 🔢</Text>
        </Link>
      </Section>
      <Section>
        <Button
        label={<Text bold align="center">Clear Settings</Text>}
        onClick={() => props.settingsStorage.clear()}
        />
        <Text align="left">Made by Dennis Kats</Text>
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);