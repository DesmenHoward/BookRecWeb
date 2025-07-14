import { useState } from 'react';
import { X, Send, Heart, MoreVertical } from 'lucide-react';
import { useUserProfileStore } from '../store/userProfileStore';

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
  postAuthor: string;
  initialComments?: Comment[];
}

export default function CommentsModal({ 
  visible, 
  onClose, 
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
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
          <h2 className="text-xl font-semibold">Comments</h2>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>

        {/* Comments List */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {comments.length > 0 ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              </p>
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3 mb-4">
                  <img 
                    src={comment.userAvatar} 
                    alt={comment.userName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{comment.userName}</span>
                      <span className="text-sm text-gray-500">{comment.timestamp}</span>
                    </div>
                    <p className="mt-1 text-gray-800">{comment.text}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <button 
                        onClick={() => handleLikeComment(comment.id)}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-accent"
                      >
                        <Heart 
                          size={16} 
                          className={comment.isLiked ? 'fill-accent text-accent' : ''} 
                        />
                        {comment.likes > 0 && comment.likes}
                      </button>
                      <button 
                        onClick={() => handleReply(comment.userName)}
                        className="text-sm text-gray-600 hover:text-accent"
                      >
                        Reply
                      </button>
                      {comment.userId === profile?.id && (
                        <button className="text-sm text-gray-600 hover:text-accent">
                          <MoreVertical size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">No Comments Yet</h3>
              <p className="text-gray-600">
                Be the first to comment on {postAuthor}'s post
              </p>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          {replyingTo && (
            <div className="flex items-center justify-between mb-2 px-3 py-1 bg-gray-100 rounded">
              <span className="text-sm">
                Replying to <span className="font-semibold">@{replyingTo}</span>
              </span>
              <button 
                onClick={() => setReplyingTo(null)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              className="p-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}