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
      <Section title={<Text bold align="center">Tutorial 📄</Text>}>
        <Link source="https://denk0403.github.io/algedraw%20calculator/help.html">
          <Text align="center">• How To Draw The Numbers ✏️</Text>
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