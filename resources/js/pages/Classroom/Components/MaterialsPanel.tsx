import { useState, useEffect } from 'react';
import { useDataChannel } from '@livekit/components-react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface Material {
    id: number;
    name: string;
    type: 'pdf' | 'image' | 'document' | 'video';
    url: string;
    size?: string;
}

interface MaterialsPanelProps {
    bookingId: number;
    materials: Material[];
    isTeacher: boolean;
    onClose: () => void;
    onMaterialsChange: (materials: Material[]) => void;
}

export default function MaterialsPanel({ 
    bookingId,
    materials, 
    isTeacher, 
    onClose,
    onMaterialsChange 
}: MaterialsPanelProps) {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Real-time sync via LiveKit data channel
    const { send, message } = useDataChannel('materials');

    // Handle incoming material updates
    useEffect(() => {
        if (!message) return;
        try {
            const decoder = new TextDecoder();
            const text = decoder.decode(message.payload);
            const data = JSON.parse(text);
            
            if (data.type === 'MATERIAL_ADDED') {
                // Check if material already exists
                const exists = materials.some(m => m.id === data.material.id);
                if (!exists) {
                    onMaterialsChange([data.material, ...materials]);
                }
            } else if (data.type === 'MATERIAL_DELETED') {
                onMaterialsChange(materials.filter(m => m.id !== data.materialId));
            }
        } catch (err) {
            console.error('Failed to parse materials message:', err);
        }
    }, [message, materials, onMaterialsChange]);

    const fileConfig: Record<string, { icon: string; bg: string; text: string }> = {
        pdf: { icon: 'mdi:file-pdf-box', bg: 'bg-light-pink', text: 'text-destructive' },
        image: { icon: 'mdi:file-image', bg: 'bg-pale-blue/30', text: 'text-blue' },
        video: { icon: 'mdi:file-video', bg: 'bg-light-purple/30', text: 'text-purple' },
        document: { icon: 'mdi:file-document', bg: 'bg-pale-green', text: 'text-primary' },
    };

    const getFileConfig = (type: string) => fileConfig[type] || { icon: 'mdi:file', bg: 'bg-gray-100', text: 'text-gray-500' };
    const handleDownload = (material: Material) => window.open(material.url, '_blank');


    const handleUpload = async (files: FileList | null) => {
        if (!files?.length) return;
        
        setUploading(true);
        setError(null);

        try {
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append('file', file);

                const response = await axios.post(`/classroom/${bookingId}/materials`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const newMaterial = response.data.material;
                
                // Add new material to local list
                onMaterialsChange([newMaterial, ...materials]);
                
                // Broadcast to other participants
                const encoder = new TextEncoder();
                send(encoder.encode(JSON.stringify({
                    type: 'MATERIAL_ADDED',
                    material: newMaterial
                })), { reliable: true });
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload file');
            setTimeout(() => setError(null), 4000);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, material: Material) => {
        e.stopPropagation();
        
        if (!confirm('Are you sure you want to delete this file?')) return;

        try {
            await axios.delete(`/classroom/${bookingId}/materials/${material.id}`);
            onMaterialsChange(materials.filter(m => m.id !== material.id));
            
            // Broadcast deletion to other participants
            const encoder = new TextEncoder();
            send(encoder.encode(JSON.stringify({
                type: 'MATERIAL_DELETED',
                materialId: material.id
            })), { reliable: true });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete file');
            setTimeout(() => setError(null), 4000);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleUpload(e.dataTransfer.files);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-pale-green flex items-center justify-center">
                        <Icon icon="mdi:folder-open" className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-body-s-semibold text-foreground">Materials</h3>
                        <p className="text-body-xs-regular text-muted-foreground">{materials.length} files</p>
                    </div>
                </div>
                <button 
                    onClick={onClose} 
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                    <Icon icon="mdi:close" className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            {/* Error Toast */}
            {error && (
                <div className="mx-4 mt-4 px-3 py-2 bg-light-pink border border-pink rounded-lg flex items-center gap-2">
                    <Icon icon="mdi:alert-circle" className="w-4 h-4 text-destructive flex-shrink-0" />
                    <span className="text-body-xs-medium text-destructive">{error}</span>
                </div>
            )}

            {/* Upload (Teacher only) */}
            {isTeacher && (
                <div className="p-4 border-b border-gray-100">
                    <label 
                        className={cn(
                            "flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl cursor-pointer transition-all",
                            uploading ? "border-primary bg-pale-green" : 
                            dragOver ? "border-primary bg-pale-green" : 
                            "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        )}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                    >
                        <input 
                            type="file" 
                            className="hidden" 
                            multiple 
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4" 
                            onChange={(e) => handleUpload(e.target.files)} 
                            disabled={uploading} 
                        />
                        {uploading ? (
                            <>
                                <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
                                <span className="text-body-s-medium text-primary">Uploading...</span>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                    <Icon icon="mdi:cloud-upload-outline" className="w-6 h-6 text-gray-400" />
                                </div>
                                <span className="text-body-s-medium text-foreground">Upload Materials</span>
                                <span className="text-body-xs-regular text-muted-foreground mt-1">Drag & drop or click (max 50MB)</span>
                            </>
                        )}
                    </label>
                </div>
            )}


            {/* Materials List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {materials.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <Icon icon="mdi:folder-open-outline" className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-body-s-medium text-foreground">No materials yet</p>
                        <p className="text-body-xs-regular text-muted-foreground mt-1 max-w-[180px]">
                            {isTeacher ? 'Upload files to share with your student' : 'Your teacher will share materials here'}
                        </p>
                    </div>
                ) : (
                    materials.map((material) => {
                        const config = getFileConfig(material.type);
                        return (
                            <div
                                key={material.id}
                                className="group flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all cursor-pointer animate-fade-in"
                                onClick={() => handleDownload(material)}
                            >
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", config.bg)}>
                                    <Icon icon={config.icon} className={cn("w-5 h-5", config.text)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-body-s-medium text-foreground truncate">{material.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-body-xs-regular text-muted-foreground uppercase">{material.type}</span>
                                        {material.size && (
                                            <>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-body-xs-regular text-muted-foreground">{material.size}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                                        <Icon icon="mdi:download" className="w-4 h-4 text-primary" />
                                    </div>
                                    {isTeacher && (
                                        <button
                                            onClick={(e) => handleDelete(e, material)}
                                            className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center hover:bg-light-pink hover:border-pink transition-colors"
                                        >
                                            <Icon icon="mdi:delete-outline" className="w-4 h-4 text-destructive" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2 text-body-xs-regular text-muted-foreground">
                    <Icon icon="mdi:sync" className="w-4 h-4 text-primary" />
                    <span>Files sync in real-time with all participants</span>
                </div>
            </div>
        </div>
    );
}
