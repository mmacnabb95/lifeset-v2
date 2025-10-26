import React, { useState } from "react";
import { View, ScrollView, TextInput, Pressable } from "react-native";
import FullScreenWithBackground from "../fullScreenWithBackground/fullScreenWithBackground";
import { Typography, Button } from "src/components/common";
import { TypographyTypes } from "src/components/common/typography";
import { ButtonTypes } from "src/components/common/button";
import constants from "src/themes/constants";
import { ForumCategory, FORUM_POSTS } from "./constants";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

const CreateForumPostScreen = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<ForumCategory>(
    ForumCategory.GENERAL,
  );

  const handleSubmit = () => {
    // Validate required fields
    if (!title.trim() || !content.trim()) {
      // TODO: Show error message
      return;
    }

    // Create new post
    const newPost = {
      id: (FORUM_POSTS.length + 1).toString(), // Simple ID generation
      title: title.trim(),
      content: content.trim(),
      category,
      author: "You", // TODO: Get actual user name
      date: new Date().toISOString(),
      replies: 0,
      likes: 0,
    };

    // Add to posts array
    FORUM_POSTS.unshift(newPost);

    // Navigate back to forum
    navigation.goBack();
  };

  return (
    <FullScreenWithBackground>
      <ScrollView style={{ flex: 1 }} bounces={false}>
        <View style={{ flex: 1, paddingTop: 20 }}>
          <View style={{ paddingHorizontal: 20 }}>
            <Typography
              type={TypographyTypes.H4}
              text="Create New Post"
              style={{
                color: constants.white,
                marginBottom: 10,
              }}
            />
            <Typography
              type={TypographyTypes.Body1}
              text="Share your thoughts with the community"
              style={{
                color: constants.white,
                marginBottom: 20,
              }}
            />
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: "#EFEEF5",
              borderTopLeftRadius: constants.radiusXXLarge,
              borderTopRightRadius: constants.radiusXXLarge,
              padding: 20,
            }}
          >
            <View style={{ marginBottom: 20 }}>
              <Typography
                type={TypographyTypes.Body2}
                text="Title"
                style={{
                  color: constants.black600,
                  marginBottom: 8,
                }}
              />
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Enter post title"
                placeholderTextColor={constants.black300}
                style={{
                  backgroundColor: constants.white,
                  borderRadius: 12,
                  padding: 15,
                  fontSize: 16,
                  color: constants.black900,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
                testID="post-title-input"
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Typography
                type={TypographyTypes.Body2}
                text="Category"
                style={{
                  color: constants.black600,
                  marginBottom: 8,
                }}
              />
              <View
                style={{
                  backgroundColor: constants.white,
                  borderRadius: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <Picker
                  selectedValue={category}
                  onValueChange={(value) => setCategory(value)}
                  testID="post-category-picker"
                  style={{
                    color: constants.black900,
                  }}
                >
                  {Object.values(ForumCategory).map((cat) => (
                    <Picker.Item
                      key={cat}
                      label={cat}
                      value={cat}
                      color={constants.black900}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={{ marginBottom: 20 }}>
              <Typography
                type={TypographyTypes.Body2}
                text="Content"
                style={{
                  color: constants.black600,
                  marginBottom: 8,
                }}
              />
              <TextInput
                value={content}
                onChangeText={setContent}
                placeholder="Write your post content"
                placeholderTextColor={constants.black300}
                multiline
                textAlignVertical="top"
                style={{
                  height: 200,
                  backgroundColor: constants.white,
                  borderRadius: 12,
                  padding: 15,
                  fontSize: 16,
                  color: constants.black900,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
                testID="post-content-input"
              />
            </View>

            <Button
              onPress={handleSubmit}
              type={ButtonTypes.Primary}
              title="Post"
              testID="submit-post-button"
              style={{
                marginBottom: 20,
              }}
            />
          </View>
        </View>
      </ScrollView>
    </FullScreenWithBackground>
  );
};

export default CreateForumPostScreen;
