function mySettings(props) {
  return (
    <Page>
      <Section title={<Text bold align="center">App Settings ⌚️</Text>}>
        <Toggle
          settingsKey="toggleVibrations"
          label={`In-App Vibrations: ${props.settings.toggleVibrations === 'true' ? 'On' : 'Off'}`}
        />
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