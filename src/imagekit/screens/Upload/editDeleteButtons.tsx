import React from "react";
import { View } from "react-native";
import { Button, ButtonTypes } from "src/components/common/button";

const useStyles = require("./styles/styles").default;

export const EditDeleteButtons = ({
  openFileSelector,
  deleteResource,
  style,
}: {
  openFileSelector?: ((key: string) => Promise<void>) | undefined;
  deleteResource?: (id?: number, meta?: any) => void;
  style?: any;
}) => {
  const styles = useStyles();

  if (openFileSelector && deleteResource) {
    return (
      <View
        style={[
          {
            flexDirection: "row",
            borderRadius: 8,
            borderWidth: 0,
            backgroundColor: "transparent",
            width: 80,
            position: "absolute",
            zIndex: 1,
            top: 8,
            right: 16,
          },
          style,
        ]}
      >
        <Button
          testID="edit-media"
          type={ButtonTypes.IconButton}
          icon="edit-pencil"
          iconSize={20}
          onPress={openFileSelector as any}
          style={styles.editButton}
        />

        <Button
          testID="delete-media"
          type={ButtonTypes.IconButton}
          iconSize={20}
          icon="trash"
          style={styles.deleteButton}
          onPress={deleteResource}
        />
      </View>
    );
  } else {
    return null;
  }
};
