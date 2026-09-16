import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import type { LibraryBook, BookIssueRecord } from '../../types';
import { X, Book, Plus, Search, CheckCircle2, RotateCcw, User, Clock, AlertTriangle } from 'lucide-react';

interface LibraryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LibraryManagementModal: React.FC<LibraryManagementModalProps> = ({ isOpen, onClose }) => {
  const { currentSchool, students } = useSchool();
  const { showError } = useToast();
  const [activeTab, setActiveTab] = useState<'catalog' | 'issues'>('catalog');
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [issues, setIssues] = useState<BookIssueRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // New Book state
  const [showAddBook, setShowAddBook] = useState(false);
  const [accNo, setAccNo] = useState('BK-101');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('संस्कार व महापुरुष');
  const [totalCopies, setTotalCopies] = useState(5);
  const [shelfLocation, setShelfLocation] = useState('रैक A-1');

  // Issue Book modal state
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueBookId, setIssueBookId] = useState('');
  const [issueBorrowerType, setIssueBorrowerType] = useState<'student' | 'staff'>('student');
  const [issueStudentId, setIssueStudentId] = useState('');
  const [issueDueDate, setIssueDueDate] = useState(() => new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const fetchLibraryData = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const [bookData, issueData] = await Promise.all([
        api.getBooks(currentSchool.id),
        api.getBookIssues(currentSchool.id)
      ]);
      setBooks(bookData);
      setIssues(issueData);
    } catch (err) {
      setFetchError(true);
      showError('पुस्तकालय डेटा लोड करने में त्रुटि। कृपया पुनः प्रयास करें।');
      console.error('Failed to load library data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLibraryData();
    }
  }, [isOpen, currentSchool.id]);

  if (!isOpen) return null;

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newBook = await api.createBook({
        schoolId: currentSchool.id,
        accessionNo: accNo,
        title,
        author,
        category,
        totalCopies,
        availableCopies: totalCopies,
        shelfLocation
      });
      setBooks(prev => [newBook, ...prev]);
      setShowAddBook(false);
      setTitle('');
      setAuthor('');
      setAccNo(`BK-${Date.now().toString().slice(-6)}`);
    } catch (err: any) {
      alert(err.message || 'पुस्तक जोड़ने में त्रुटि।');
    }
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const book = books.find(b => b.id === issueBookId);
    if (!book) return;

    let borrowerName = 'विद्यार्थी';
    let borrowerContact = '';
    if (issueBorrowerType === 'student') {
      const st = students.find(s => s.id === issueStudentId);
      if (st) {
        borrowerName = `${st.name} (${st.class})`;
        borrowerContact = st.contact;
      }
    }

    try {
      const createdIssue = await api.issueBook({
        schoolId: currentSchool.id,
        bookId: book.id,
        bookTitle: book.title,
        accessionNo: book.accessionNo,
        borrowerType: issueBorrowerType,
        borrowerId: issueStudentId || 'unknown',
        borrowerName,
        borrowerContact,
        dueDate: issueDueDate,
        status: 'Issued'
      });
      setIssues(prev => [createdIssue, ...prev]);
      setBooks(prev => prev.map(b => b.id === book.id ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) } : b));
      setShowIssueModal(false);
    } catch (err: any) {
      alert(err.message || 'पुस्तक जारी करने में त्रुटि।');
    }
  };

  const handleReturnBook = async (issueId: string) => {
    const fine = prompt('विलंब शुल्क (Fine ₹ यदि लागू हो):', '0');
    try {
      const updated = await api.returnBook(issueId, Number(fine) || 0);
      setIssues(prev => prev.map(i => i.id === issueId ? updated : i));
      // update book copies in state
      setBooks(prev => prev.map(b => b.id === updated.bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b));
    } catch (err: any) {
      alert(err.message || 'पुस्तक वापसी दर्ज करने में त्रुटि।');
    }
  };

  const filteredBooks = books.filter(b => {
    if (categoryFilter !== 'all' && b.category !== categoryFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.accessionNo.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-stone-200 relative my-6 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center text-xl">
              <Book className="w-5 h-5 text-orange-700" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900">
                सरस्वती पुस्तकालय प्रबंधन (SSM Library System)
              </h3>
              <p className="text-xs text-stone-500">
                {currentSchool.hindiName} • ग्रंथ सूची, निर्गमन व वापसी पंजिका
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center justify-between pt-3 pb-2 border-b border-stone-100 shrink-0 text-xs font-bold">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'catalog' ? 'bg-orange-700 text-white shadow-xs' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Book className="w-4 h-4" />
              <span>ग्रंथ सूची (Book Catalog — {books.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('issues')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'issues' ? 'bg-orange-700 text-white shadow-xs' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>निर्गमन व वापसी पंजिका ({issues.filter(i => i.status === 'Issued').length} सक्रिय)</span>
            </button>
          </div>

          {activeTab === 'catalog' && (
            <button
              onClick={() => setShowAddBook(!showAddBook)}
              className="px-3.5 py-1.5 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl flex items-center gap-1 shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>नई पुस्तक जोड़ें</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              {/* Search & filters */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    placeholder="पुस्तक शीर्षक, लेखक अथवा परिग्रहण क्रमांक (Accession No) से खोजें..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs font-bold"
                >
                  <option value="all">सभी श्रेणियां</option>
                  <option value="संस्कार व महापुरुष">संस्कार व महापुरुष</option>
                  <option value="गीता व उपनिषद">गीता व उपनिषद</option>
                  <option value="संस्कृत साहित्य">संस्कृत साहित्य</option>
                  <option value="विज्ञान व गणित">विज्ञान व गणित</option>
                  <option value="हिंदी साहित्य">हिंदी साहित्य</option>
                  <option value="सामान्य ज्ञान">सामान्य ज्ञान</option>
                </select>
              </div>

              {showAddBook && (
                <form onSubmit={handleCreateBook} className="bg-amber-50/70 p-5 rounded-2xl border border-orange-200 space-y-3">
                  <h4 className="font-bold text-orange-950 text-sm">नवीन पुस्तक पंजीकरण</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">परिग्रहण क्र. (Acc No.)</label>
                      <input
                        required
                        value={accNo}
                        onChange={(e) => setAccNo(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-stone-700 mb-1">पुस्तक का शीर्षक (Title)</label>
                      <input
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="उदा. श्रीमद्भगवद्गीता यथारूप, स्वामी विवेकानंद जीवन चरित्र"
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">लेखक (Author)</label>
                      <input
                        required
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">विषय श्रेणी (Category)</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white"
                      >
                        <option value="संस्कार व महापुरुष">संस्कार व महापुरुष</option>
                        <option value="गीता व उपनिषद">गीता व उपनिषद</option>
                        <option value="संस्कृत साहित्य">संस्कृत साहित्य</option>
                        <option value="विज्ञान व गणित">विज्ञान व गणित</option>
                        <option value="हिंदी साहित्य">हिंदी साहित्य</option>
                        <option value="सामान्य ज्ञान">सामान्य ज्ञान</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">प्रतियाँ (Total Copies)</label>
                      <input
                        type="number"
                        min={1}
                        value={totalCopies}
                        onChange={(e) => setTotalCopies(Number(e.target.value) || 1)}
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddBook(false)}
                      className="px-4 py-1.5 bg-stone-200 text-stone-700 font-bold rounded-xl"
                    >
                      रद्द करें
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-1.5 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-xl shadow-xs"
                    >
                      पुस्तक जोड़ें
                    </button>
                  </div>
                </form>
              )}

              {/* Books Table */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold text-[11px] uppercase">
                      <th className="p-3">परिग्रहण क्र.</th>
                      <th className="p-3">शीर्षक व लेखक</th>
                      <th className="p-3">श्रेणी</th>
                      <th className="p-3">स्थान (Shelf)</th>
                      <th className="p-3">उपलब्ध / कुल</th>
                      <th className="p-3 text-right">कार्य</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-stone-400">
                          पुस्तकालय डेटा लोड हो रहा है...
                        </td>
                      </tr>
                    ) : fetchError ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-stone-500">
                          <AlertTriangle className="w-8 h-8 mx-auto text-red-500 mb-1" />
                          <p className="font-bold text-red-600">पुस्तकालय डेटा लोड करने में त्रुटि</p>
                          <button
                            onClick={fetchLibraryData}
                            className="mt-2 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg shadow-xs"
                          >
                            🔄 पुनः प्रयास करें
                          </button>
                        </td>
                      </tr>
                    ) : filteredBooks.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-stone-400">
                          कोई पुस्तक नहीं मिली।
                        </td>
                      </tr>
                    ) : (
                      filteredBooks.map(book => (
                        <tr key={book.id} className="hover:bg-amber-50/20">
                          <td className="p-3 font-mono font-bold text-stone-800">{book.accessionNo}</td>
                          <td className="p-3">
                            <span className="font-bold text-stone-900 block">{book.title}</span>
                            <span className="text-[11px] text-stone-500">{book.author}</span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-900">
                              {book.category}
                            </span>
                          </td>
                          <td className="p-3 text-stone-600 font-mono">{book.shelfLocation}</td>
                          <td className="p-3 font-bold">
                            <span className={book.availableCopies > 0 ? 'text-emerald-700' : 'text-red-700'}>
                              {book.availableCopies}
                            </span>
                            <span className="text-stone-400"> / {book.totalCopies}</span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              disabled={book.availableCopies <= 0}
                              onClick={() => {
                                setIssueBookId(book.id);
                                setShowIssueModal(true);
                              }}
                              className="px-3 py-1 bg-orange-700 hover:bg-orange-800 text-white font-bold rounded-lg text-xs transition disabled:opacity-40"
                            >
                              निर्गमन (Issue)
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'issues' && (
            <div className="bg-white rounded-2xl border border-stone-200 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold text-[11px] uppercase">
                    <th className="p-3">परिग्रहण क्र.</th>
                    <th className="p-3">पुस्तक का नाम</th>
                    <th className="p-3">प्राप्तकर्ता (Borrower)</th>
                    <th className="p-3">निर्गमन तिथि</th>
                    <th className="p-3">अंतिम तिथि</th>
                    <th className="p-3">स्थिति</th>
                    <th className="p-3 text-right">वापसी (Return)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {issues.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone-400">
                        कोई पुस्तक निर्गमन रिकॉर्ड नहीं है।
                      </td>
                    </tr>
                  ) : (
                    issues.map(issue => (
                      <tr key={issue.id} className="hover:bg-amber-50/20">
                        <td className="p-3 font-mono font-bold text-stone-800">{issue.accessionNo}</td>
                        <td className="p-3 font-bold text-stone-900">{issue.bookTitle}</td>
                        <td className="p-3 text-stone-700">{issue.borrowerName}</td>
                        <td className="p-3 text-stone-600">{issue.issueDate}</td>
                        <td className="p-3 font-semibold text-orange-900">{issue.dueDate}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            issue.status === 'Issued' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {issue.status === 'Issued' ? 'निर्गमित (Issued)' : 'वापस प्राप्त'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {issue.status === 'Issued' && (
                            <button
                              onClick={() => handleReturnBook(issue.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition"
                            >
                              वापस लें
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sub-Modal: Issue Book */}
        {showIssueModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
              <h4 className="font-bold text-stone-900 text-base mb-4">पुस्तक निर्गमन (Issue Book)</h4>
              <form onSubmit={handleIssueSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">विद्यार्थी चुनें</label>
                  <select
                    value={issueStudentId}
                    onChange={(e) => setIssueStudentId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  >
                    <option value="">-- छात्र चुनें --</option>
                    {students.map(st => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.class} - {st.rollNo})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">वापसी की अंतिम तिथि (Due Date)</label>
                  <input
                    type="date"
                    required
                    value={issueDueDate}
                    onChange={(e) => setIssueDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowIssueModal(false)}
                    className="px-4 py-2 bg-stone-100 font-bold rounded-xl"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-700 text-white font-bold rounded-xl shadow-xs"
                  >
                    निर्गमित करें
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

