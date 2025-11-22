import { useState } from 'react';
import { Upload, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type Props = {
    currentAvatarUrl?: string;
    onUploadComplete?: (url: string) => void;
};

export const AvatarUpload = ({ currentAvatarUrl, onUploadComplete }: Props) => {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentAvatarUrl);

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                return;
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

            // Upload para o Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                throw uploadError;
            }

            // Obter URL pública
            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const avatarUrl = urlData.publicUrl;

            // Atualizar perfil
            if (user) {
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ avatar_url: avatarUrl })
                    .eq('id', user.id);

                if (updateError) throw updateError;
            }

            setPreview(avatarUrl);
            onUploadComplete?.(avatarUrl);
            alert('Foto de perfil atualizada com sucesso!');
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Erro ao fazer upload. Tente novamente.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-white/10 border-2 border-neon-purple flex items-center justify-center">
                    {preview ? (
                        <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <Camera size={48} className="text-gray-400" />
                    )}
                </div>
                <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 w-10 h-10 bg-neon-purple hover:bg-neon-purple/80 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg"
                >
                    {uploading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <Upload size={20} className="text-white" />
                    )}
                </label>
                <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                    className="hidden"
                />
            </div>
            <p className="text-sm text-gray-400">Clique para alterar foto</p>
        </div>
    );
};
