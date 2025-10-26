import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { useXP } from '../useXP';

interface JournalEntryProps {
  onSubmit: (entry: string) => void;
}

const JournalEntry: React.FC<JournalEntryProps> = ({ onSubmit }) => {
  const [entry, setEntry] = useState('');
  const { awardXP } = useXP();

  const handleSubmit = () => {
    if (entry.trim()) {
      onSubmit(entry);
      awardXP('CREATE_JOURNAL');
      setEntry('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        multiline
        value={entry}
        onChangeText={setEntry}
        placeholder="Write your journal entry..."
      />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default JournalEntry; 