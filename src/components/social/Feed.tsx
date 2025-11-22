import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, UserPlus, UserMinus } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { addXP, updateChallengeProgress, XP_VALUES, CHALLENGE_TYPES } from '../../lib/gamification';

type Post = {
    id: number;
    user_id: string;
    username: string;
    avatar_url: string;
    content: string;
    likes: number;
    comments: number;
    created_at: string;
    is_liked?: boolean;
    is_following?: boolean;
};

type Comment = {
    id: number;
    username: string;
    avatar_url: string;
    content: string;
    likes: number;
    created_at: string;
};

export const Feed = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
    const [comments, setComments] = useState<Record<number, Comment[]>>({});
    const [newCommentContent, setNewCommentContent] = useState<Record<number, string>>({});

    useEffect(() => {
        fetchPosts();
    }, [user]);

    const fetchPosts = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching posts:', error);
            return;
        }

        // Enriquecer posts com informações de like e follow
        const enrichedPosts = await Promise.all((data || []).map(async (post) => {
            const { data: likeData } = await supabase
                .from('post_likes')
                .select('id')
                .eq('post_id', post.id)
                .eq('user_id', user.id)
                .single();

            const { data: followData } = await supabase
                .from('user_follows')
                .select('id')
                .eq('follower_id', user.id)
                .eq('following_id', post.user_id)
                .single();

            return {
                ...post,
                is_liked: !!likeData,
                is_following: !!followData
            };
        }));

        setPosts(enrichedPosts);
    };

    const handleLike = async (postId: number) => {
        if (!user) return;

        const post = posts.find(p => p.id === postId);
        if (!post) return;

        if (post.is_liked) {
            // Unlike
            await supabase
                .from('post_likes')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', user.id);

            setPosts(posts.map(p =>
                p.id === postId ? { ...p, is_liked: false, likes: p.likes - 1 } : p
            ));
        } else {
            // Like
            await supabase
                .from('post_likes')
                .insert([{ post_id: postId, user_id: user.id }]);

            setPosts(posts.map(p =>
                p.id === postId ? { ...p, is_liked: true, likes: p.likes + 1 } : p
            ));
        }
    };

    const handleFollow = async (userId: string) => {
        if (!user) return;

        const post = posts.find(p => p.user_id === userId);
        if (!post) return;

        if (post.is_following) {
            // Unfollow
            await supabase
                .from('user_follows')
                .delete()
                .eq('follower_id', user.id)
                .eq('following_id', userId);

            setPosts(posts.map(p =>
                p.user_id === userId ? { ...p, is_following: false } : p
            ));
        } else {
            // Follow
            await supabase
                .from('user_follows')
                .insert([{ follower_id: user.id, following_id: userId }]);

            setPosts(posts.map(p =>
                p.user_id === userId ? { ...p, is_following: true } : p
            ));
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() || !user) return;

        const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', user.id)
            .single();

        const { error } = await supabase.from('posts').insert([{
            user_id: user.id,
            username: profile?.username || user.email?.split('@')[0] || 'User',
            avatar_url: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
            content: newPostContent,
            likes: 0,
            comments: 0
        }]);

        if (error) {
            console.error('Error creating post:', error);
        } else {
            // Adicionar XP
            await addXP(user.id, XP_VALUES.POST_CREATE, 'post', 'Post criado');

            // Atualizar desafio de posts
            const { data: todayChallenge } = await supabase
                .from('daily_challenges')
                .select('id')
                .eq('challenge_type', CHALLENGE_TYPES.POST)
                .eq('active_date', new Date().toISOString().split('T')[0])
                .single();

            if (todayChallenge) {
                await updateChallengeProgress(user.id, todayChallenge.id);
            }

            setNewPostContent('');
            fetchPosts();
        }
    };

    const fetchComments = async (postId: number) => {
        const { data, error } = await supabase
            .from('post_comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching comments:', error);
        } else {
            setComments({ ...comments, [postId]: data || [] });
        }
    };

    const toggleComments = async (postId: number) => {
        if (!expandedComments[postId]) {
            await fetchComments(postId);
        }
        setExpandedComments({ ...expandedComments, [postId]: !expandedComments[postId] });
    };

    const handleComment = async (postId: number) => {
        if (!user || !newCommentContent[postId]?.trim()) return;

        const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', user.id)
            .single();

        const { error } = await supabase.from('post_comments').insert([{
            post_id: postId,
            user_id: user.id,
            username: profile?.username || user.email?.split('@')[0] || 'User',
            avatar_url: profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
            content: newCommentContent[postId],
            likes: 0
        }]);

        if (error) {
            console.error('Error creating comment:', error);
        } else {
            // Adicionar XP
            await addXP(user.id, XP_VALUES.COMMENT_CREATE, 'comment', 'Comentário criado');

            setNewCommentContent({ ...newCommentContent, [postId]: '' });
            await fetchComments(postId);
            fetchPosts(); // Atualizar contador de comentários
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Create Post */}
            <GlassCard className="p-6">
                <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Compartilhe algo inspirador..."
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple transition-colors resize-none"
                />
                <button
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim()}
                    className="mt-3 px-6 py-2 bg-neon-purple hover:bg-neon-purple/80 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Publicar
                </button>
            </GlassCard>

            {/* Posts */}
            {posts.map((post) => (
                <GlassCard key={post.id} className="p-6">
                    {/* Post Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <img
                                src={post.avatar_url}
                                alt={post.username}
                                className="w-10 h-10 rounded-full"
                            />
                            <div>
                                <h3 className="font-semibold text-white">{post.username}</h3>
                                <p className="text-xs text-gray-400">
                                    {new Date(post.created_at).toLocaleString('pt-BR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                        {user && post.user_id !== user.id && (
                            <button
                                onClick={() => handleFollow(post.user_id)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${post.is_following
                                        ? 'bg-white/10 text-gray-400 hover:bg-white/20'
                                        : 'bg-neon-purple text-white hover:bg-neon-purple/80'
                                    }`}
                            >
                                {post.is_following ? (
                                    <>
                                        <UserMinus size={16} />
                                        Seguindo
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={16} />
                                        Seguir
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Post Content */}
                    <p className="text-gray-200 mb-4">{post.content}</p>

                    {/* Post Actions */}
                    <div className="flex items-center gap-6 text-gray-400">
                        <button
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-2 hover:text-neon-pink transition-colors ${post.is_liked ? 'text-neon-pink' : ''
                                }`}
                        >
                            <Heart size={20} fill={post.is_liked ? 'currentColor' : 'none'} />
                            <span>{post.likes}</span>
                        </button>
                        <button
                            onClick={() => toggleComments(post.id)}
                            className="flex items-center gap-2 hover:text-neon-purple transition-colors"
                        >
                            <MessageCircle size={20} />
                            <span>{post.comments}</span>
                        </button>
                    </div>

                    {/* Comments Section */}
                    {expandedComments[post.id] && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                            {/* Comment Input */}
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={newCommentContent[post.id] || ''}
                                    onChange={(e) => setNewCommentContent({ ...newCommentContent, [post.id]: e.target.value })}
                                    onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                                    placeholder="Escreva um comentário..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple transition-colors"
                                />
                                <button
                                    onClick={() => handleComment(post.id)}
                                    disabled={!newCommentContent[post.id]?.trim()}
                                    className="px-4 py-2 bg-neon-purple hover:bg-neon-purple/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={18} />
                                </button>
                            </div>

                            {/* Comments List */}
                            <div className="space-y-3">
                                {comments[post.id]?.map((comment) => (
                                    <div key={comment.id} className="flex gap-3">
                                        <img
                                            src={comment.avatar_url}
                                            alt={comment.username}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <div className="flex-1 bg-white/5 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-white text-sm">{comment.username}</span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(comment.created_at).toLocaleTimeString('pt-BR', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-gray-300 text-sm">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </GlassCard>
            ))}
        </div>
    );
};
