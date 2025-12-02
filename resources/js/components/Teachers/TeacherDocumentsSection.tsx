import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import DocumentUploadModal from './DocumentUploadModal';
import DocumentVerificationModal from './DocumentVerificationModal';
import { toast } from 'sonner';

interface Certificate {
    id: number;
    name: string; // This maps to 'title' in DB
    title: string;
    file_path: string;
    file_name: string;
    verification_status: string;
    certificate_type: string;
}

interface TeacherDocumentsSectionProps {
    teacher: {
        id: number;
        certificates?: Certificate[];
    };
}

export default function TeacherDocumentsSection({ teacher }: TeacherDocumentsSectionProps) {
    const certificates = teacher.certificates || [];

    // Filter documents by type
    const idFront = certificates.find(c => c.certificate_type === 'id_card_front');
    const idBack = certificates.find(c => c.certificate_type === 'id_card_back');
    const cv = certificates.find(c => c.certificate_type === 'cv');
    const otherCertificates = certificates.filter(c => !['id_card_front', 'id_card_back', 'cv'].includes(c.certificate_type));

    // ID Verification Status
    const hasIdFront = !!idFront;
    const hasIdBack = !!idBack;
    const isIdUploaded = hasIdFront && hasIdBack;

    // Check if ID is fully verified (both front and back must be verified)
    const isIdVerified = idFront?.verification_status === 'verified' && idBack?.verification_status === 'verified';
    const isIdPending = isIdUploaded && !isIdVerified;

    const idVerificationStatus = isIdVerified
        ? 'Verified'
        : (isIdUploaded ? 'Pending Verification' : 'Pending Upload');

    // CV Status
    const hasCvUploaded = !!cv;
    const isCvVerified = cv?.verification_status === 'verified';

    // Upload Modal State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadType, setUploadType] = useState<'id_card_front' | 'id_card_back' | 'cv' | 'certificate'>('certificate');

    // Verification Modal State
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [certToVerify, setCertToVerify] = useState<{ id: number; title: string } | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    const openUploadModal = (type: 'id_card_front' | 'id_card_back' | 'cv' | 'certificate') => {
        setUploadType(type);
        setIsUploadModalOpen(true);
    };

    const handleVerifyClick = (id: number, title: string) => {
        setCertToVerify({ id, title });
        setIsVerifyModalOpen(true);
    };

    const confirmVerify = () => {
        if (!certToVerify) return;

        setIsVerifying(true);
        router.post(`/admin/teachers/${teacher.id}/documents/${certToVerify.id}/verify`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsVerifying(false);
                setIsVerifyModalOpen(false);
                setCertToVerify(null);
                // Toast handled globally
            },
            onError: () => {
                setIsVerifying(false);
                toast.error('Verification failed');
            }
        });
    };

    return (
        <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-[16px] p-[32px] w-full mb-8">
            {/* Title */}
            <h3 className="font-['Nunito'] font-semibold text-[24px] text-[#101928] leading-[1.2] mb-[32px]">
                Document Section
            </h3>

            {/* ID Verification Section */}
            <div className="border border-[rgba(0,0,0,0.1)] rounded-[12px] p-[24px] mb-[24px]">
                <div className="flex items-center gap-2 mb-[20px]">
                    <p className="font-['Outfit'] font-normal text-[16px] text-[#101928]">
                        ID Verification:
                    </p>
                    <div className="flex items-center gap-1">
                        {isIdVerified ? (
                            <Icon icon="mdi:check-circle" className="w-4 h-4 text-green-600" />
                        ) : isIdUploaded ? (
                            <Icon icon="mdi:clock-outline" className="w-4 h-4 text-amber-500" />
                        ) : (
                            <Icon icon="mdi:alert-circle" className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`font-['Outfit'] font-light text-[14px] ${isIdVerified ? 'text-green-600' : 'text-[#6B7280]'}`}>
                            {idVerificationStatus}
                        </span>
                    </div>
                </div>

                {/* ID Documents Grid */}
                <div className="grid grid-cols-2 gap-[24px] mb-[16px]">
                    {/* Document Front */}
                    <div>
                        <div className="flex justify-between items-center mb-[12px]">
                            <p className="font-['Outfit'] font-normal text-[14px] text-[#101928]">
                                Document Front
                            </p>
                            {idFront && idFront.verification_status === 'pending' && (
                                <button
                                    onClick={() => handleVerifyClick(idFront.id, 'ID Card (Front)')}
                                    className="text-xs bg-[#338078] text-white px-2 py-1 rounded hover:bg-[#2a6a63] transition-colors"
                                >
                                    Verify
                                </button>
                            )}
                        </div>
                        <div className="bg-gray-100 rounded-[8px] h-[120px] flex items-center justify-center overflow-hidden relative group">
                            {hasIdFront ? (
                                <>
                                    <Icon icon="mdi:card-account-details" className="w-12 h-12 text-gray-400" />
                                    {/* Overlay for viewing if needed */}
                                    <a href={`/storage/${idFront.file_path}`} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white font-['Outfit'] text-sm">
                                        View
                                    </a>
                                </>
                            ) : (
                                <button
                                    onClick={() => openUploadModal('id_card_front')}
                                    className="flex flex-col items-center gap-2 w-full h-full justify-center hover:bg-gray-200 transition-colors"
                                >
                                    <Icon icon="mdi:cloud-upload-outline" className="w-8 h-8 text-gray-400" />
                                    <span className="text-gray-400 text-xs">Upload Front</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Document Back */}
                    <div>
                        <div className="flex justify-between items-center mb-[12px]">
                            <p className="font-['Outfit'] font-normal text-[14px] text-[#101928]">
                                Document Back
                            </p>
                            {idBack && idBack.verification_status === 'pending' && (
                                <button
                                    onClick={() => handleVerifyClick(idBack.id, 'ID Card (Back)')}
                                    className="text-xs bg-[#338078] text-white px-2 py-1 rounded hover:bg-[#2a6a63] transition-colors"
                                >
                                    Verify
                                </button>
                            )}
                        </div>
                        <div className="bg-gray-100 rounded-[8px] h-[120px] flex items-center justify-center overflow-hidden relative group">
                            {hasIdBack ? (
                                <>
                                    <Icon icon="mdi:card-account-details" className="w-12 h-12 text-gray-400" />
                                    <a href={`/storage/${idBack.file_path}`} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white font-['Outfit'] text-sm">
                                        View
                                    </a>
                                </>
                            ) : (
                                <button
                                    onClick={() => openUploadModal('id_card_back')}
                                    className="flex flex-col items-center gap-2 w-full h-full justify-center hover:bg-gray-200 transition-colors"
                                >
                                    <Icon icon="mdi:cloud-upload-outline" className="w-8 h-8 text-gray-400" />
                                    <span className="text-gray-400 text-xs">Upload Back</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Links */}
                <div className="flex justify-end gap-[16px]">
                    {!isIdUploaded && (
                        <button
                            onClick={() => openUploadModal('id_card_front')}
                            className="font-['Outfit'] font-normal text-[14px] text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Upload ID
                        </button>
                    )}
                    {isIdUploaded && (
                        <>
                            <button
                                onClick={() => openUploadModal('id_card_front')}
                                className="font-['Outfit'] font-normal text-[14px] text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                            >
                                Re-upload ID
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Certificates Section */}
            <div className="border border-[rgba(0,0,0,0.1)] rounded-[12px] p-[24px] mb-[24px]">
                <div className="flex items-center justify-between mb-[20px]">
                    <div className="flex items-center gap-2">
                        <p className="font-['Outfit'] font-normal text-[16px] text-[#101928]">
                            Certificates:
                        </p>
                        <div className="flex items-center gap-1">
                            {otherCertificates.length > 0 ? (
                                <Icon icon="mdi:check-circle" className="w-4 h-4 text-green-600" />
                            ) : (
                                <Icon icon="mdi:alert-circle" className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="font-['Outfit'] font-light text-[14px] text-[#6B7280]">
                                {otherCertificates.length > 0 ? 'Uploaded' : 'None Uploaded'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => openUploadModal('certificate')}
                        className="font-['Outfit'] font-normal text-[14px] text-[#338078] hover:text-[#2a6a63] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                        <Icon icon="mdi:plus" className="w-4 h-4" />
                        Add Certificate
                    </button>
                </div>

                {/* Certificates Grid */}
                <div className="grid grid-cols-2 gap-[24px]">
                    {otherCertificates.length > 0 ? (
                        otherCertificates.map((cert) => (
                            <div key={cert.id}>
                                <div className="flex justify-between items-center mb-[12px]">
                                    <p className="font-['Outfit'] font-normal text-[14px] text-[#338078]">
                                        {cert.title || cert.name}
                                    </p>
                                    {cert.verification_status === 'pending' ? (
                                        <button
                                            onClick={() => handleVerifyClick(cert.id, cert.title || cert.name)}
                                            className="text-xs bg-[#338078] text-white px-2 py-1 rounded hover:bg-[#2a6a63] transition-colors"
                                        >
                                            Verify
                                        </button>
                                    ) : cert.verification_status === 'verified' ? (
                                        <span className="text-xs text-green-600 flex items-center gap-1">
                                            <Icon icon="mdi:check-circle" className="w-3 h-3" /> Verified
                                        </span>
                                    ) : (
                                        <span className="text-xs text-red-500">Rejected</span>
                                    )}
                                </div>
                                <div className="bg-gray-100 rounded-[8px] h-[120px] flex items-center justify-center mb-[12px]">
                                    <Icon icon="mdi:certificate" className="w-12 h-12 text-gray-400" />
                                </div>
                                <div className="flex justify-center gap-[16px]">
                                    <a
                                        href={`/storage/${cert.file_path}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-['Outfit'] font-normal text-[14px] text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        View
                                    </a>
                                    {/* Re-upload for specific certificate not implemented in modal yet, would need to pass cert ID */}
                                    {/* For now, just show View */}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                            <p className="font-['Outfit'] font-light text-[14px] text-gray-400 mb-2">
                                No certificates uploaded
                            </p>
                            <button
                                onClick={() => openUploadModal('certificate')}
                                className="font-['Outfit'] font-medium text-[14px] text-[#338078] hover:underline"
                            >
                                Upload a certificate
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* CV/Resume Section */}
            <div className="border border-[rgba(0,0,0,0.1)] rounded-[12px] p-[24px]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <p className="font-['Outfit'] font-normal text-[16px] text-[#101928]">
                            CV/Resume:
                        </p>
                        <div className="flex items-center gap-1">
                            {isCvVerified ? (
                                <Icon icon="mdi:check-circle" className="w-4 h-4 text-green-600" />
                            ) : hasCvUploaded ? (
                                <Icon icon="mdi:clock-outline" className="w-4 h-4 text-amber-500" />
                            ) : (
                                <Icon icon="mdi:alert-circle" className="w-4 h-4 text-gray-400" />
                            )}
                            <span className={`font-['Outfit'] font-light text-[14px] ${isCvVerified ? 'text-green-600' : 'text-[#6B7280]'}`}>
                                {isCvVerified ? 'Verified' : (hasCvUploaded ? 'Pending Verification' : 'Not Uploaded')}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {cv && (
                            <div className="flex flex-col items-end mr-2">
                                <span className="text-sm text-gray-700 font-medium">{cv.file_name}</span>
                            </div>
                        )}

                        {cv && cv.verification_status === 'pending' && (
                            <button
                                onClick={() => handleVerifyClick(cv.id, 'CV/Resume')}
                                className="text-xs bg-[#338078] text-white px-3 py-1.5 rounded hover:bg-[#2a6a63] transition-colors"
                            >
                                Verify CV
                            </button>
                        )}

                        {hasCvUploaded ? (
                            <>
                                <button
                                    onClick={() => openUploadModal('cv')}
                                    className="font-['Outfit'] font-normal text-[14px] text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                                >
                                    Re-upload
                                </button>
                                <a
                                    href={`/storage/${cv.file_path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-['Outfit'] font-normal text-[14px] text-[#338078] hover:text-[#2a6a63] transition-colors flex items-center gap-1"
                                >
                                    Download CV.pdf
                                    <Icon icon="mdi:download" className="w-4 h-4" />
                                </a>
                            </>
                        ) : (
                            <button
                                onClick={() => openUploadModal('cv')}
                                className="font-['Outfit'] font-normal text-[14px] text-[#338078] hover:text-[#2a6a63] transition-colors flex items-center gap-1"
                            >
                                <Icon icon="mdi:cloud-upload-outline" className="w-4 h-4" />
                                Upload CV
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <DocumentUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                teacherId={teacher.id}
                type={uploadType}
            />

            <DocumentVerificationModal
                isOpen={isVerifyModalOpen}
                onClose={() => setIsVerifyModalOpen(false)}
                onConfirm={confirmVerify}
                documentTitle={certToVerify?.title || 'Document'}
                isProcessing={isVerifying}
            />
        </div>
    );
}
