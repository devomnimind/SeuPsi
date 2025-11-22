import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

// State will be initialized inside the component

export const Feed = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [newPostContent, setNewPostContent] = useState('');
    // Fetch posts on mount
    useEffect(() => {
        const fetchPosts = async () => {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) console.error('Error fetching posts:', error);
            else setPosts(data || []);
        };
        fetchPosts();
    }, []);

    const handleLike = async (id: number) => {
        const post = posts.find(p => p.id === id);
        if (!post) return;
        const { error } = await supabase
            .from('posts')
            .update({ likes: post.likes + 1 })
            .eq('id', id);
        if (error) console.error('Error updating like:', error);
        else setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() || !user) return;
        const { error } = await supabase.from('posts').insert([
            {
                user_id: user.id,
                username: user.email?.split('@')[0] || 'User',
                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
                content: newPostContent,
                likes: 0,
                comments: 0
            }
        ]);
        if (error) console.error('Error creating post:', error);
        else {
            setNewPostContent('');
            // Refresh posts
            const { data, error: fetchError } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
            if (fetchError) console.error('Error refetching posts:', fetchError);
            else setPosts(data || []);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Create Post Input */}
            <GlassCard className="p-4">
                <div className="flex gap-4">
                    <img
                        src={user ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}` : 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                        alt="User"
                        className="w-10 h-10 rounded-full bg-indigo-100"
                    />
                    <input
                        type="text"
                        placeholder="O que você está pensando?"
                        value={newPostContent}
                        onChange={e => setNewPostContent(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder-gray-400 focus:outline-none focus:border-neon-purple transition-colors"
                    />
                    <button
                        onClick={handleCreatePost}
                        className="px-3 py-1 bg-neon-purple text-white rounded hover:bg-neon-purple/80 transition-colors"
                    >Postar</button>
                </div>
            </GlassCard>

            {/* Posts Feed */}
            {posts.map(post => (
                <GlassCard key={post.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <img
                                src={post.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.username}`}
                                alt={post.username}
                                className="w-10 h-10 rounded-full bg-indigo-100"
                            />
                            <div>
                                <h3 className="font-bold text-white">{post.username}</h3>
                                <span className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                        <button className="text-gray-400 hover:text-white transition-colors">
                            <MoreHorizontal size={20} />
                        </button>
                    </div>

                    <p className="text-gray-200 mb-6 leading-relaxed">
                        {post.content}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <button
                            onClick={() => handleLike(post.id)}
                            className="flex items-center gap-2 text-gray-400 hover:text-neon-pink transition-colors group"
                        >
                            <Heart size={20} className="group-hover:scale-110 transition-transform" />
                            <span>{post.likes}</span>
                        </button>

                        <button className="flex items-center gap-2 text-gray-400 hover:text-neon-purple transition-colors group">
                            <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
                            <span>{post.comments}</span>
                        </button>

                        <button className="flex items-center gap-2 text-gray-400 hover:text-neon-green transition-colors group">
                            <Share2 size={20} className="group-hover:scale-110 transition-transform" />
                            <span>Compartilhar</span>
                        </button>
                    </div>
                </GlassCard>
            ))}
        </div>

    );
};
