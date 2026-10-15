import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ExternalLink, PlusCircle, Trash2, Edit3, X, Check, Lock } from 'lucide-react';

export default function Resources() {
  const { token, user } = useAuth();
  const [resources, setResources] = useState([]);
  
  // Modals & Popups state
  const [showFormModal, setShowFormModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Forms state
  const [form, setForm] = useState({ title: '', description: '', link: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', link: '' });
  const [error, setError] = useState('');

  const fetchResources = async () => {
    try {
      const res = await client.get('/resources');
      setResources(res.data);
    } catch (err) {
      console.error('Error fetching resources:', err);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleAddClick = () => {
    if (!token) {
      setShowAuthModal(true);
    } else {
      setShowFormModal(true);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await client.post('/resources', form);
      setForm({ title: '', description: '', link: '' });
      setError('');
      setShowFormModal(false);
      fetchResources();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add resource');
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      title: item.title,
      description: item.description || '',
      link: item.details?.link || '',
    });
  };

  const handleUpdate = async (id) => {
    try {
      await client.put(`/resources/${id}`, editForm);
      setEditingId(null);
      fetchResources();
    } catch (err) {
      console.error('Error updating resource:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await client.delete(`/resources/${id}`);
      fetchResources();
    } catch (err) {
      console.error('Error deleting resource:', err);
    }
  };

  // Helper to determine if current logged-in user owns this resource
  const checkIsOwner = (item) => {
    if (!token) return false;
    if (!user) return true; // Fallback: if logged in but JWT claims vary, display buttons for authenticated user

    const currentUserId = String(user.user_id || user.id || user.sub || '');
    const resourceUserId = String(item.user_id || '');

    // Match either by user ID or username/sub claim
    return (
      currentUserId === resourceUserId ||
      user.sub === item.user_id ||
      user.username === item.user_id
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Top Header Bar with Add Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Learning Resources</h1>
          <p className="text-slate-400 text-sm mt-1">
            Discover and share community-curated dev guides and tutorials.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 px-5 py-2.5 rounded-lg font-medium transition cursor-pointer shadow-md"
        >
          <PlusCircle className="w-5 h-5" /> Share Resource
        </button>
      </div>

      {/* Grid of Resources */}
      <div className="grid gap-5 md:grid-cols-2">
        {resources.map((item) => {
          const isOwner = checkIsOwner(item);

          return (
            <div
              key={item.id}
              className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-col justify-between"
            >
              {editingId === item.id ? (
                // EDIT MODE
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm focus:outline-none focus:border-sky-500"
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm focus:outline-none focus:border-sky-500"
                  />
                  <input
                    type="url"
                    value={editForm.link}
                    onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm focus:outline-none focus:border-sky-500"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleUpdate(item.id)}
                      className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                // READ MODE
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-sky-300">{item.title}</h3>
                    <p className="text-slate-400 text-sm mt-2">{item.description}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-700">
                    {item.details?.link ? (
                      <a
                        href={item.details.link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-sky-400 hover:underline text-sm font-medium"
                      >
                        Visit Link <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span />
                    )}

                    {/* EDIT & DELETE BUTTONS FOR OWNER */}
                    {isOwner && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(item)}
                          className="text-amber-400 hover:text-amber-300 p-1 cursor-pointer transition"
                          title="Edit Resource"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer transition"
                          title="Delete Resource"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* POPUP MODAL 1: AUTHENTICATION REQUIRED (Logged Out Users) */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-sm w-full text-center relative shadow-2xl">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Login Required</h3>
            <p className="text-slate-300 text-sm mb-6">
              Please log in or create an account to share new learning resources with the community.
            </p>
            <div className="flex gap-3">
              <Link
                to="/login"
                className="flex-1 bg-slate-700 hover:bg-slate-600 py-2.5 rounded-lg text-sm font-medium text-center transition"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="flex-1 bg-sky-600 hover:bg-sky-700 py-2.5 rounded-lg text-sm font-medium text-center transition"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL 2: SHARE RESOURCE FORM (Authenticated Users) */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-lg w-full relative shadow-2xl">
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <PlusCircle className="text-sky-400" /> Share a Resource
            </h2>
            {error && <p className="text-rose-400 text-sm mb-3">{error}</p>}
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="Resource Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-sky-500"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-sky-500"
              />
              <input
                type="url"
                placeholder="URL Link (https://...)"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-sky-500"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  Publish Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}