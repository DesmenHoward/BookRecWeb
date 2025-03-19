import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  FlatList, 
  Image,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { X, Send, Heart, MoveVertical as MoreVertical } from 'lucide-react-native';
import { useUserProfileStore } from '../store/userProfileStore';

// Theme colors
const THEME = {
  primary: '#7D6E83',
  accent: '#A75D5D',
  background: '#F9F5EB',
  surface: '#EFE3D0',
  text: '#4F4557',
  textLight: '#7D6E83',
  border: '#D0B8A8'
};

// Default profile picture URL
const DEFAULT_PROFILE_PICTURE = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  postAuthor: string;
  initialComments?: Comment[];
}

export default function CommentsModal({ 
  visible, 
  onClose, 
  postId,
  postAuthor,
  initialComments = []
}: CommentsModalProps) {
  const { profile } = useUserProfileStore();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      userId: profile?.id || 'anonymous',
      userName: profile?.displayName || 'Anonymous User',
      userAvatar: profile?.profilePicture || DEFAULT_PROFILE_PICTURE,
      text: replyingTo ? `@${replyingTo} ${newComment}` : newComment,
      timestamp: 'Just now',
      likes: 0,
      isLiked: false
    };

    setComments([comment, ...comments]);
    setNewComment('');
    setReplyingTo(null);
  };

  const handleLikeComment = (commentId: string) => {
    setComments(comments.map(comment => 
      comment.id === commentId
        ? { 
            ...comment, 
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
          }
        : comment
    ));
  };

  const handleReply = (userName: string) => {
    setReplyingTo(userName);
    // Focus the input
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentContainer}>
      <Image source={{ uri: item.userAvatar }} style={styles.commentAvatar} />
      
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUserName}>{item.userName}</Text>
          <Text style={styles.commentTimestamp}>{item.timestamp}</Text>
        </View>
        
        <Text style={styles.commentText}>{item.text}</Text>
        
        <View style={styles.commentActions}>
          <TouchableOpacity 
            style={styles.commentAction}
            onPress={() => handleLikeComment(item.id)}
          >
            <Heart 
              size={16} 
              color={item.isLiked ? THEME.accent : THEME.textLight}
              fill={item.isLiked ? THEME.accent : 'transparent'}
            />
            {item.likes > 0 && (
              <Text style={[
                styles.actionText,
                item.isLiked && styles.actionTextActive
              ]}>
                {item.likes}
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.commentAction}
            onPress={() => handleReply(item.userName)}
          >
            <Text style={styles.actionText}>Reply</Text>
          </TouchableOpacity>
          
          {item.userId === profile?.id && (
            <TouchableOpacity style={styles.commentAction}>
              <MoreVertical size={16} color={THEME.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comments</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.commentsList}
          ListHeaderComponent={
            comments.length > 0 ? (
              <Text style={styles.commentsCount}>
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              </Text>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No Comments Yet</Text>
                <Text style={styles.emptyStateText}>
                  Be the first to comment on {postAuthor}'s post
                </Text>
              </View>
            )
          }
        />
        
        <View style={styles.inputContainer}>
          {replyingTo && (
            <View style={styles.replyingContainer}>
              <Text style={styles.replyingText}>
                Replying to <Text style={styles.replyingName}>@{replyingTo}</Text>
              </Text>
              <TouchableOpacity 
                onPress={() => setReplyingTo(null)}
                style={styles.cancelReply}
              >
                <X size={16} color={THEME.textLight} />
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.inputRow}>
            <Image 
              source={{ uri: profile?.profilePicture || DEFAULT_PROFILE_PICTURE }} 
              style={styles.inputAvatar} 
            />
            <TextInput
              style={styles.input}
              placeholder="Write a comment..."
              placeholderTextColor="#999999"
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                !newComment.trim() && styles.sendButtonDisabled
              ]}
              onPress={handleSubmitComment}
              disabled={!newComment.trim()}
            >
              <Send size={20} color={newComment.trim() ? 'white' : '#666666'} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    backgroundColor: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 5,
  },
  commentsList: {
    padding: 15,
  },
  commentsCount: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 15,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUserName: {
    color: 'white',
    fontWeight: '600',
    marginRight: 8,
  },
  commentTimestamp: {
    color: '#666666',
    fontSize: 12,
  },
  commentText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    color: '#CCCCCC',
    fontSize: 12,
    marginLeft: 4,
  },
  actionTextActive: {
    color: THEME.accent,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#333333',
    padding: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
  },
  replyingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#222222',
    borderRadius: 8,
    marginBottom: 10,
  },
  replyingText: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  replyingName: {
    color: THEME.accent,
    fontWeight: '600',
  },
  cancelReply: {
    padding: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#222222',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    color: 'white',
    fontSize: 14,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#222222',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyStateTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateText: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
  },
});