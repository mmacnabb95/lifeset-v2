import React, { useState, useMemo, useEffect, useCallback } from "react";
import { View, ScrollView, Pressable, TextInput } from "react-native";
import { Typography, Button } from "src/components/common";
import { TypographyTypes } from "src/components/common/typography";
import { ButtonTypes } from "src/components/common/button";
import constants from "src/themes/constants";
import FullScreenWithBackground from "../fullScreenWithBackground/fullScreenWithBackground";
import { FORUM_POSTS } from "./constants";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "src/useAuth";
import { API_BASE_URL } from "src/config/api";
import { Settings } from "../../../../../types/domain/flat-types";
import { useSelector } from "react-redux";
import { settingsSelector } from "src/redux/domain/features/settings/collection-slice";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { Loading } from "src/components/common/loading/loading";

const ForumPostScreen = ({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) => {
  const postId = route.params?.postId;
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [post, setPost] = useState<any>(null);
  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getAuthHeaders } = useAuth();

  const fetchPost = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/forum-post/${postId}`, {
        headers,
      });

      console.log(postId);

      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      setPost(data);
    } catch (err) {
      console.log("Error fetching post:", err);

      setError(err instanceof Error ? err.message : "Failed to fetch posts");
      // Fallback to sample data in development
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const { userId, language, companyId, roles } = useUserInfo();

  const settings: Settings = useSelector(settingsSelector(userId));

  const createReply = async () => {
    if (!replyText.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/forum-reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({
          postId: postId,
          content: replyText.trim(),
          author: settings?.Name,
        }),
      });

      if (!response.ok) throw new Error("Failed to create reply");

      console.log("Reply created successfully");
    } catch (err) {
      console.log("Error creating reply:", err);
      setError(err instanceof Error ? err.message : "Failed to create reply");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;

    // For now, just add to local data
    if (post) {
      // Increment reply count
      post.replies = (post.replies || 0) + 1;

      // Initialize replyList if it doesn't exist
      if (!post.replyList) {
        post.replyList = [];
      }

      // Create new reply
      const newReply = {
        id: `r${Date.now()}`, // Simple ID generation
        content: replyText.trim(),
        author: settings?.Name, // TODO: Get actual user name
        date: new Date().toISOString(),
        likes: 0,
      };

      // Add to reply list
      post.replyList.unshift(newReply);

      await createReply();
    }

    setReplyText("");
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (post) {
      navigation.setOptions({
        title: post.title,
        headerLeft: () => (
          <Pressable
            onPress={() => navigation.goBack()} // 🔄 goBack triggers focus in previous screen
            style={{ marginLeft: 16 }}
          >
            <Ionicons name="arrow-back" size={24} color={constants.white} />
          </Pressable>
        ),
      });
    }
  }, [navigation, post]);

  if (!post) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Loading />
      </View>
    );
  }

  return (
    <FullScreenWithBackground>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#EFEEF5",
            borderTopLeftRadius: constants.radiusXXLarge,
            borderTopRightRadius: constants.radiusXXLarge,
            marginTop: 20,
            padding: 20,
          }}
        >
          {/* Post Content */}
          <View
            style={{
              backgroundColor: constants.white,
              borderRadius: 12,
              padding: 15,
              marginBottom: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Typography
                type={TypographyTypes.H4}
                text={post.title}
                style={{
                  color: constants.black900,
                  marginBottom: 8,
                }}
              />
              <Typography
                type={TypographyTypes.Caption1}
                text={new Date(post.date).toLocaleDateString()}
                style={{
                  color: constants.black400,
                }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Typography
                type={TypographyTypes.Body2}
                text={post.author}
                style={{
                  color: constants.black600,
                }}
              />

              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: constants.black600,
                  marginHorizontal: 8,
                }}
              />
              <Typography
                type={TypographyTypes.Body2}
                text={post.category}
                style={{
                  color: constants.black600,
                }}
              />
            </View>

            <Typography
              type={TypographyTypes.Body1}
              text={post.content}
              style={{
                color: constants.black900,
                marginBottom: 16,
              }}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                borderTopWidth: 1,
                borderTopColor: "rgba(0, 0, 0, 0.1)",
                paddingTop: 16,
              }}
            >
              <Typography
                type={TypographyTypes.Body2}
                text={`${post.replies} replies`}
                style={{
                  color: constants.black600,
                }}
              />

              {/* <Pressable
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 4,
                }}
              >
                <Ionicons
                  name="heart-outline"
                  size={16}
                  color={constants.black600}
                  style={{ marginRight: 4 }}
                />
                <Typography
                  type={TypographyTypes.Body2}
                  text={`${post.likes} likes`}
                  style={{
                    color: constants.black600,
                  }}
                />
              </Pressable> */}
            </View>
          </View>

          {/* Reply Section */}
          <View style={{ marginBottom: 20 }}>
            <Typography
              type={TypographyTypes.H6}
              text={`Replies (${post.replies})`}
              style={{
                color: constants.black900,
                marginBottom: 12,
              }}
            />

            {post.replyList?.map((reply: any) => (
              <View
                key={reply.id}
                style={{
                  backgroundColor: constants.white,
                  borderRadius: 12,
                  padding: 15,
                  marginBottom: 10,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <Typography
                    type={TypographyTypes.Body2}
                    text={reply.author}
                    style={{
                      color: constants.black600,
                    }}
                  />
                  <Typography
                    type={TypographyTypes.Caption1}
                    text={new Date(reply.date).toLocaleDateString()}
                    style={{
                      color: constants.black400,
                    }}
                  />
                </View>
                <Typography
                  type={TypographyTypes.Body1}
                  text={reply.content}
                  style={{
                    color: constants.black900,
                  }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    marginTop: 8,
                    alignItems: "center",
                  }}
                >
                  {/* <Pressable
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 4,
                    }}
                  >
                    <Ionicons
                      name="heart-outline"
                      size={16}
                      color={constants.black600}
                      style={{ marginRight: 4 }}
                    />
                    <Typography
                      type={TypographyTypes.Caption1}
                      text={reply.likes.toString()}
                      style={{
                        color: constants.black600,
                      }}
                    />
                  </Pressable> */}
                </View>
              </View>
            ))}

            {post.replyList?.length === 0 && (
              <Typography
                type={TypographyTypes.Body2}
                text="No replies yet. Be the first to reply!"
                style={{
                  color: constants.black600,
                  textAlign: "center",
                  marginTop: 10,
                }}
              />
            )}
          </View>

          {/* Reply Input */}
          <View
            style={{
              backgroundColor: constants.white,
              borderRadius: 12,
              padding: 15,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <TextInput
              value={replyText}
              onChangeText={setReplyText}
              placeholder="Write a reply..."
              placeholderTextColor={constants.black300}
              multiline
              style={{
                minHeight: 80,
                color: constants.black900,
                fontSize: 16,
                textAlignVertical: "top",
              }}
            />
            <Button
              onPress={handleReply}
              type={ButtonTypes.Primary}
              title={isSubmitting ? "Sending..." : "Reply"}
              disabled={!replyText.trim() || isSubmitting}
              style={{ marginTop: 10 }}
            />
          </View>
        </View>
      </ScrollView>
    </FullScreenWithBackground>
  );
};

export default ForumPostScreen;
