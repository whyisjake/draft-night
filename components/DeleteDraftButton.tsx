'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteDraftButtonProps {
  draftId: string;
  draftName: string;
}

export default function DeleteDraftButton({ draftId, draftName }: DeleteDraftButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/drafts/${draftId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete draft');
      }
    } catch (error) {
      alert('Failed to delete draft');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="text-xs text-gray-500">Delete {draftName}?</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Yes'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
          className="text-gray-600 hover:text-gray-800"
        >
          No
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-red-600 hover:text-red-800"
    >
      Delete
    </button>
  );
}
