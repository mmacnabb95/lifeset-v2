import React, { useState, useMemo, useCallback, useEffect } from "react";
import { ScrollView, View, Pressable, TextInput, Modal } from "react-native";
import FullScreenWithBackground from "../fullScreenWithBackground/fullScreenWithBackground";
import { Typography, Button } from "src/components/common";
import { TypographyTypes } from "src/components/common/typography";
import { ButtonTypes } from "src/components/common/button";
import constants from "src/themes/constants";
import { ForumCategory, CATEGORY_DESCRIPTIONS, FORUM_POSTS } from "./constants";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL, API_ENDPOINTS } from "../../../config/api";
import { useAuth } from "../../../hooks/useAuth";
import { Settings } from "../../../../../types/domain/flat-types";
import { useSelector } from "react-redux";
import { settingsSelector } from "src/redux/domain/features/settings/collection-slice";
import { useUserInfo } from "src/redux/features/userInfo/useUserInfo";
import { useFocusEffect } from "@react-navigation/native";

const useLayoutStyles = require("../../../themes/layout/styles/styles").default;

// First, let's add a type for our color mapping
type CategoryColor = {
  bg: string;
  text: string;
};

// Add default colors
const DEFAULT_COLORS: CategoryColor = {
  bg: "#F5F5F5",
  text: "#666666",
};

// Update the color mapping with type safety
const CATEGORY_COLORS: Record<ForumCategory, CategoryColor> = {
  [ForumCategory.GENERAL]: { bg: "#E3F2FD", text: "#1976D2" },
  [ForumCategory.HABITS]: { bg: "#F3E5F5", text: "#7B1FA2" },
  [ForumCategory.FITNESS]: { bg: "#E8F5E9", text: "#2E7D32" },
  [ForumCategory.MINDFULNESS]: { bg: "#FFF3E0", text: "#E65100" },
  [ForumCategory.GOALS]: { bg: "#E0F7FA", text: "#006064" },
};

// Update the emoji mapping to match all categories in ForumCategory enum
const CATEGORY_EMOJIS: Record<ForumCategory, string> = {
  [ForumCategory.GENERAL]: "💭",
  [ForumCategory.HABITS]: "📝",
  [ForumCategory.FITNESS]: "💪",
  [ForumCategory.MINDFULNESS]: "✨",
  [ForumCategory.GOALS]: "🎯",
};

// Add ForumPost type
interface ForumPost {
  id: string | number;
  title: string;
  content: string;
  category: ForumCategory;
  author: string;
  date: string;
  replies: number;
  likes: number;
  replyList?: Array<{
    id: string;
    content: string;
    author: string;
    date: string;
    likes: number;
  }>;
}

const CommunityForumScreen = ({
  navigation,
  route,
  summaryOnly,
  style,
  scrollEnabled = true,
}: {
  navigation: any;
  route: any;
  summaryOnly?: boolean;
  style?: any;
  scrollEnabled?: boolean;
}) => {
  const layoutStyles = useLayoutStyles();
  const [selectedCategory, setSelectedCategory] =
    useState<ForumCategory | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState<ForumCategory>(
    ForumCategory.GENERAL,
  );
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getAuthHeaders } = useAuth();

  // Update fetchPosts to handle async auth headers
  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/forum-posts`, {
        headers,
      });
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      setPosts(data.reverse()); // 🔄 Reverse the order here
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch posts");
      // Fallback to sample data in development
      if (__DEV__) {
        console.warn("Using sample data in development");
        setPosts(FORUM_POSTS);
      }
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  // Load posts on component mount
  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [fetchPosts]),
  );

  const filteredPosts = useMemo(() => {
    if (!selectedCategory) return posts;
    return posts.filter((post) => post.category === selectedCategory);
  }, [selectedCategory, posts]);

  // Update handleCreatePost to handle async auth headers
  const { userId, language, companyId, roles } = useUserInfo();

  const settings: Settings = useSelector(settingsSelector(userId));

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    try {
      setIsLoading(true);
      setError(null);

      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.FORUM.CREATE_POST}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({
            title: newPostTitle.trim(),
            content: newPostContent.trim(),
            category: newPostCategory,
            author: settings?.Name,
          }),
        },
      );

      if (!response.ok) throw new Error("Failed to create post");

      await fetchPosts();

      setNewPostTitle("");
      setNewPostContent("");
      setNewPostCategory(ForumCategory.GENERAL);
      setIsComposing(false);
    } catch (err) {
      console.log("Error creating post:", err);
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  const CategoryModal = () => (
    <Modal
      visible={isCategoryModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setIsCategoryModalVisible(false)}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
        onPress={() => setIsCategoryModalVisible(false)}
      >
        <View
          style={{
            backgroundColor: constants.white,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            maxHeight: "80%",
          }}
        >
          <Typography
            type={TypographyTypes.H6}
            text="Select Category"
            style={{
              color: constants.black900,
              marginBottom: 15,
              textAlign: "center",
            }}
          />
          {Object.values(ForumCategory).map((category) => (
            <Pressable
              key={category}
              onPress={() => {
                setNewPostCategory(category);
                setIsCategoryModalVisible(false);
              }}
              style={{
                paddingVertical: 15,
                borderBottomWidth: 1,
                borderBottomColor: constants.black100,
              }}
            >
              <Typography
                type={TypographyTypes.Body1}
                text={category}
                style={{
                  color:
                    newPostCategory === category
                      ? constants.primaryColor
                      : constants.black900,
                }}
              />
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <FullScreenWithBackground headerCompenstation={summaryOnly ? false : true}>
      <CategoryModal />
      <ScrollView
        style={{ height: "100%" }}
        nestedScrollEnabled={false}
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          {
            justifyContent: "space-between",
            marginTop: summaryOnly ? 0 : -20,
            flexGrow: 1,
          },
          style,
        ]}
        scrollEnabled={scrollEnabled}
      >
        <View
          style={{
            paddingHorizontal: 20,
            alignItems: "center",
            paddingTop: summaryOnly ? 0 : 20,
          }}
        >
          <Typography
            type={TypographyTypes.H4}
            text="Our Community"
            style={{
              color: constants.white,
              marginBottom: 10,
              fontSize: 22,
              fontWeight: "600",
            }}
          />

          {/* Summary view for dashboard tile */}
          {summaryOnly && (
            <Pressable
              onPress={() => {
                navigation.navigate("CommunityForum");
              }}
              style={({ pressed }) => ({
                width: "100%",
                paddingBottom: 16,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Typography
                type={TypographyTypes.Body1}
                text="Join the conversation with your peers"
                style={{
                  color: constants.white,
                  textAlign: "center",
                  marginBottom: 20,
                  fontSize: 16,
                  opacity: 0.9,
                }}
              />
              {/* Preview of latest posts */}
              {posts.slice(0, 2).map((post) => (
                <View
                  key={post.id}
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: 8,
                    padding: 15,
                    marginBottom: 10,
                  }}
                >
                  <Typography
                    text={post.title}
                    type={TypographyTypes.Body2}
                    style={{
                      color: constants.white,
                      marginBottom: 5,
                    }}
                  />
                  <Typography
                    text={`${post.category} • ${post.replies} replies`}
                    type={TypographyTypes.Caption1}
                    style={{
                      color: "rgba(255, 255, 255, 0.7)",
                    }}
                  />
                </View>
              ))}
            </Pressable>
          )}
        </View>

        {/* Full screen view */}
        {!summaryOnly && (
          <>
            <View
              style={{
                flexGrow: 1,
                backgroundColor: "#EFEEF5",
                borderTopLeftRadius: constants.radiusXXLarge,
                borderTopRightRadius: constants.radiusXXLarge,
                paddingHorizontal: 20,
                paddingTop: 20,
              }}
            >
              {/* Post Composer */}
              {!isComposing ? (
                <Pressable
                  onPress={() => setIsComposing(true)}
                  style={({ pressed }) => [
                    {
                      backgroundColor: constants.white,
                      borderRadius: 12,
                      padding: 15,
                      marginBottom: 20,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      type={TypographyTypes.Body1}
                      text="What's on your mind?"
                      style={{
                        color: constants.black600,
                        flex: 1,
                      }}
                    />
                    <Ionicons
                      name="create-outline"
                      size={24}
                      color={constants.black600}
                    />
                  </View>
                </Pressable>
              ) : (
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
                  <TextInput
                    value={newPostTitle}
                    onChangeText={setNewPostTitle}
                    placeholder="Post title"
                    placeholderTextColor={constants.black300}
                    style={{
                      fontSize: 14,
                      color: constants.black900,
                      marginBottom: 10,
                      padding: 0,
                    }}
                  />
                  <TextInput
                    value={newPostContent}
                    onChangeText={setNewPostContent}
                    placeholder="Share your thoughts..."
                    placeholderTextColor={constants.black300}
                    multiline
                    style={{
                      fontSize: 14,
                      color: constants.black900,
                      minHeight: 80,
                      marginBottom: 10,
                      padding: 0,
                    }}
                  />
                  <Pressable
                    onPress={() => setIsCategoryModalVisible(true)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: constants.black100,
                      padding: 10,
                      borderRadius: 8,
                      marginBottom: 10,
                    }}
                  >
                    <Typography
                      type={TypographyTypes.Body2}
                      text={newPostCategory}
                      style={{
                        color: constants.black900,
                        flex: 1,
                      }}
                    />
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={constants.black600}
                    />
                  </Pressable>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "flex-end",
                      gap: 10,
                    }}
                  >
                    <Button
                      onPress={() => setIsComposing(false)}
                      type={ButtonTypes.Secondary}
                      title="Cancel"
                    />
                    <Button
                      onPress={handleCreatePost}
                      type={ButtonTypes.Primary}
                      title="Post"
                      disabled={!newPostTitle.trim() || !newPostContent.trim()}
                    />
                  </View>
                </View>
              )}

              {/* Categories */}
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginBottom: 20,
                }}
              >
                {Object.values(ForumCategory).map((category) => (
                  <Pressable
                    key={category}
                    onPress={() =>
                      setSelectedCategory(
                        category === selectedCategory ? null : category,
                      )
                    }
                    style={{
                      backgroundColor:
                        selectedCategory === category
                          ? (CATEGORY_COLORS[category] || DEFAULT_COLORS).text
                          : (CATEGORY_COLORS[category] || DEFAULT_COLORS).bg,
                      borderRadius: 20,
                      paddingHorizontal: 15,
                      paddingVertical: 8,
                      marginRight: 10,
                      marginBottom: 10,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      text={CATEGORY_EMOJIS[category]}
                      style={{
                        marginRight: 6,
                        fontSize: 16,
                      }}
                    />
                    <Typography
                      text={category}
                      type={TypographyTypes.Body2}
                      style={{
                        color:
                          selectedCategory === category
                            ? constants.white
                            : (CATEGORY_COLORS[category] || DEFAULT_COLORS)
                                .text,
                      }}
                    />
                  </Pressable>
                ))}
              </View>

              {/* Posts */}
              {filteredPosts.map((post) => (
                <Pressable
                  key={post.id}
                  onPress={() =>
                    navigation.navigate("ForumPost", {
                      postId: post.id,
                    })
                  }
                  style={{
                    backgroundColor: constants.white,
                    borderRadius: 12,
                    padding: 15,
                    marginBottom: 15,
                    borderLeftWidth: 4,
                    borderLeftColor: selectedCategory
                      ? (CATEGORY_COLORS[selectedCategory] || DEFAULT_COLORS)
                          .text
                      : (CATEGORY_COLORS[post.category] || DEFAULT_COLORS).text,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 5,
                    }}
                  >
                    <Typography
                      text={post.title}
                      type={TypographyTypes.H6}
                      style={{
                        color: constants.black900,
                        flex: 1,
                      }}
                    />
                    <Typography
                      text={post.category}
                      type={TypographyTypes.Caption1}
                      style={{
                        color: (
                          CATEGORY_COLORS[post.category] || DEFAULT_COLORS
                        ).text,
                        fontWeight: "500",
                      }}
                    />
                  </View>
                  <Typography
                    text={post.content}
                    type={TypographyTypes.Body2}
                    style={{
                      color: constants.black600,
                      marginBottom: 10,
                    }}
                    numberOfLines={2}
                  />
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      text={`${post.author}`}
                      type={TypographyTypes.Caption1}
                      style={{
                        color: constants.black600,
                      }}
                    />
                    {/* <Typography
                      text={`${post.replies} replies • ${post.likes} likes`}
                      type={TypographyTypes.Caption1}
                      style={{
                        color: constants.black600,
                      }}
                    /> */}
                    <Typography
                      text={`${post.replies} replies`}
                      type={TypographyTypes.Caption1}
                      style={{
                        color: constants.black600,
                      }}
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </FullScreenWithBackground>
  );
};

export default CommunityForumScreen;
