import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Icon } from '@iconify/react';

interface DocumentVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    documentTitle: string;
    isProcessing: boolean;
}

export default function DocumentVerificationModal({
    isOpen,
    onClose,
    onConfirm,
    documentTitle,
    isProcessing
}: DocumentVerificationModalProps) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all font-['Outfit']">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2 mb-4"
                                >
                                    <Icon icon="mdi:shield-check" className="w-6 h-6 text-[#338078]" />
                                    Verify Document
                                </Dialog.Title>

                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        Are you sure you want to verify <strong>{documentTitle}</strong>?
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        This action confirms that you have reviewed the document and it meets the requirements.
                                    </p>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                        onClick={onClose}
                                        disabled={isProcessing}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-[#338078] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a6a63] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#338078] focus-visible:ring-offset-2 disabled:opacity-50"
                                        onClick={onConfirm}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? 'Verifying...' : 'Approve & Verify'}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
