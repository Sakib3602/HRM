import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FiUploadCloud,
  FiSearch,
  FiTrash2,
  FiDownload,
  FiFileText,
  FiFile,
  FiInbox,
  FiHardDrive,
} from 'react-icons/fi';
import useAxiosHr from '../../URI/useAxiosHr';
import { useAlert } from '../../Common/Alert/useAlert';
import Alert from '../../Common/Alert/Alert';


interface DocFormValues {
  name: string;
}

interface HrDoc {
  _id: string;
  name: string;
  fileUrl: string;
  fileType: string;
  originalFileName: string;
  uploadedBy: { name: string; email: string };
  createdAt: string;
}

interface StorageInfo {
  usedFormatted: string;
  limitFormatted: string;
  percentUsed: number;
}

const fileIconColor: Record<string, string> = {
  pdf: 'text-rose-600 bg-rose-50',
  doc: 'text-blue-600 bg-blue-50',
  docx: 'text-blue-600 bg-blue-50',
  xls: 'text-emerald-600 bg-emerald-50',
  xlsx: 'text-emerald-600 bg-emerald-50',
};

const HrDocuments: React.FC = () => {
  const axiosHr = useAxiosHr();
  const queryClient = useQueryClient();
  const { alert, showAlert, hideAlert } = useAlert();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DocFormValues>();

  const { data: documents = [], isLoading } = useQuery<HrDoc[]>({
    queryKey: ['hr-documents', searchTerm],
    queryFn: async () => {
      const res = await axiosHr.get('/documents', { params: { search: searchTerm } });
      return res.data;
    },
  });

  const { data: storage } = useQuery<StorageInfo>({
    queryKey: ['hr-storage'],
    queryFn: async () => {
      const res = await axiosHr.get('/documents/storage');
      return res.data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: DocFormValues) => {
      if (!selectedFile) throw new Error('No file selected');

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('file', selectedFile);

      const res = await axiosHr.post('/documents', formData);
      return res.data;
    },
    onSuccess: () => {
      showAlert({ type: 'success', title: 'Document uploaded', message: 'The file has been saved successfully.', duration: 3 });
      reset();
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['hr-documents'] });
      queryClient.invalidateQueries({ queryKey: ['hr-storage'] });
    },
    onError: (err: any) => {
      showAlert({
        type: 'error',
        title: 'Upload failed',
        message: err?.response?.data?.message || 'Something went wrong while uploading.',
        duration: 5,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      setDeletingId(id);
      await axiosHr.delete(`/documents/${id}`);
    },
    onSuccess: () => {
      showAlert({ type: 'success', title: 'Document removed', message: 'The file has been deleted.', duration: 3 });
      queryClient.invalidateQueries({ queryKey: ['hr-documents'] });
      queryClient.invalidateQueries({ queryKey: ['hr-storage'] });
    },
    onError: (err: any) => {
      showAlert({
        type: 'error',
        title: 'Delete failed',
        message: err?.response?.data?.message || 'Could not remove the document.',
        duration: 4,
      });
    },
    onSettled: () => setDeletingId(null),
  });

  const onSubmit = (data: DocFormValues) => {
    if (!selectedFile) {
      showAlert({ type: 'warning', title: 'No file selected', message: 'Please choose a file to upload.', duration: 3 });
      return;
    }
    uploadMutation.mutate(data);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="pt-5 poppins-regular space-y-6">
      {alert && (
        <Alert type={alert.type} title={alert.title} message={alert.message} duration={alert.duration} onClose={hideAlert} />
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">HR Documents</h1>
        <p className="text-sm text-gray-500 mt-1">Upload and manage company documents, policies, and files.</p>
      </div>

      {/* Storage Usage Bar */}
      {storage && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 text-gray-700">
              <FiHardDrive size={16} />
              <span className="text-sm font-semibold">Storage used</span>
            </div>
            <span className="text-sm text-gray-500">
              {storage.usedFormatted} of {storage.limitFormatted}
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                storage.percentUsed >= 90 ? 'bg-rose-500' : storage.percentUsed >= 70 ? 'bg-amber-500' : 'bg-slate-700'
              }`}
              style={{ width: `${storage.percentUsed}%` }}
            />
          </div>
          {storage.percentUsed >= 90 && (
            <p className="text-xs text-rose-600 font-medium mt-2">
              Storage almost full. Delete unused files or contact support to increase your limit.
            </p>
          )}
        </div>
      )}

      {/* Upload Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <FiUploadCloud size={16} />
          </div>
          <h2 className="text-base font-bold text-gray-800">Upload a document</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4" noValidate>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Document name</label>
            <input
              type="text"
              placeholder="e.g. Employee Handbook 2026"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all"
              {...register('name', { required: 'Document name is required' })}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">File (PDF, DOC, XLSX)</label>
            <label className="flex items-center gap-2 w-full px-3.5 py-2.5 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 cursor-pointer hover:border-slate-400 hover:bg-gray-100 transition-colors">
              <FiUploadCloud size={16} className="shrink-0" />
              <span className="truncate">{selectedFile ? selectedFile.name : 'Choose a file...'}</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className="sm:col-span-2 pt-1">
            <button
              type="submit"
              disabled={uploadMutation.isPending}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition-all"
            >
              <FiUploadCloud size={16} />
              {uploadMutation.isPending ? 'Uploading...' : 'Upload document'}
            </button>
          </div>
        </form>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-base font-bold text-gray-800">All documents</h2>

            <div className="relative">
              <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 focus:bg-white transition-all w-64"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center gap-2 text-gray-400">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            <p className="text-sm">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2 text-gray-400">
            <FiInbox size={28} />
            <p className="text-sm">{searchTerm ? 'No documents match your search.' : 'No documents uploaded yet.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wide">Name</th>
                  <th className="py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Uploaded By</th>
                  <th className="py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">Date</th>
                  <th className="py-3 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wide text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => {
                  const iconStyle = fileIconColor[doc.fileType] || 'text-gray-600 bg-gray-100';
                  return (
                    <tr key={doc._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconStyle}`}>
                            {doc.fileType === 'pdf' ? <FiFileText size={16} /> : <FiFile size={16} />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 truncate">{doc.name}</p>
                            <p className="text-xs text-gray-400 uppercase">{doc.fileType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{doc.uploadedBy?.name}</td>
                      <td className="py-4 px-4 text-gray-500">{formatDate(doc.createdAt)}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            View
                          </a>
                          <a
                            href={doc.fileUrl}
                            download={doc.originalFileName}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <FiDownload size={13} /> Download
                          </a>
                          <button
                            onClick={() => deleteMutation.mutate(doc._id)}
                            disabled={deletingId === doc._id}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 hover:bg-red-50 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <FiTrash2 size={13} />
                            {deletingId === doc._id ? 'Removing...' : ''}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HrDocuments;