import React, { useState, useEffect, useRef } from 'react';

// CẤU HÌNH GIẢ LẬP (SAU NÀY THAY BẰNG DỮ LIỆU THẬT TỪ DATABASE/AUTH) 
// ID của Seller (Lấy từ User đang đăng nhập)
const CURRENT_USER_ID = "6564e1234567890abcdef123"; // Thay bằng ObjectId thật của User trong DB của bạn

// Danh sách danh mục (Thực tế sẽ gọi API /api/categories để lấy)
const MOCK_CATEGORIES = [
    { _id: '6745d8a9e6b8a1234567890a', name: 'Đồng hồ' },
    { _id: '6745d8a9e6b8a1234567890b', name: 'Trang sức' },
    { _id: '6745d8a9e6b8a1234567890c', name: 'Đồ điện tử' },
    { _id: '6745d8a9e6b8a1234567890d', name: 'Nghệ thuật' },
];

// TYPES
type ProductForm = {
    name: string;
    category: string;
    description: string;
    start_price: string;
    step_price: string;
    buy_now_price: string;
    end_date: string;
};

const CreateProduct: React.FC = () => {
    // STATE
    const [form, setForm] = useState<ProductForm>({
        name: '',
        category: '',
        description: '',
        start_price: '',
        step_price: '',
        buy_now_price: '',
        end_date: '',
    });

    const [images, setImages] = useState<Array<{ file?: File; preview: string }>>([]);
    const [durationSelect, setDurationSelect] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const [priceError, setPriceError] = useState<string>('');
    // Refs
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // EFFECTS
    // Cleanup memory ảnh preview khi unmount
    useEffect(() => {
        return () => {
            images.forEach(it => it.preview && URL.revokeObjectURL(it.preview));
        };
    }, [images]);

    // HANDLERS
    
    // Xử lý nhập liệu text/select
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Cập nhật form
        setForm(prev => {
            const newForm = { ...prev, [name]: value };
            
            // Logic validate Giá mua ngay > Giá khởi điểm
            if (name === 'buy_now_price' || name === 'start_price') {
                const start = Number(name === 'start_price' ? value : prev.start_price);
                const buyNow = Number(name === 'buy_now_price' ? value : prev.buy_now_price);

                if (buyNow > 0 && buyNow <= start) {
                    setPriceError('Giá mua ngay phải lớn hơn giá khởi điểm!');
                } else {
                    setPriceError('');
                }
            }
            return newForm;
        });
    };

    // Xử lý chọn thời gian đấu giá
    const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value; // val sẽ là '1', '3', '7' hoặc 'custom'
        setDurationSelect(val); 

        if (val === 'custom') {
            setForm(prev => ({ ...prev, end_date: '' })); // Reset để user tự chọn ngày
        } else if (val) {
            // Tính toán ngày dựa trên số ngày đã chọn
            const days = parseInt(val);
            const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
            setForm(prev => ({ ...prev, end_date: futureDate.toISOString() }));
        } else {
            setForm(prev => ({ ...prev, end_date: '' }));
        }
    };

    // Xử lý File (Chung cho cả Input và Drop)
    const processFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const limit = 10;
        const currentCount = images.length;
        const availableSlots = limit - currentCount;

        if (availableSlots <= 0) return alert('Đã đạt giới hạn 10 ảnh!');

        const arr: Array<{ file?: File; preview: string }> = [];
        const countToAdd = Math.min(files.length, availableSlots);
        
        for (let i = 0; i < countToAdd; i++) {
            const f = files[i];
            if (!f.type.startsWith('image/')) continue;
            arr.push({ file: f, preview: URL.createObjectURL(f) });
        }

        setImages(prev => [...prev, ...arr]);
    };

    const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files);
        e.target.value = ''; // Reset input
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        processFiles(e.dataTransfer.files);
    };

    const removeImageAt = (index: number) => {
        setImages(prev => {
            const clone = [...prev];
            URL.revokeObjectURL(clone[index].preview);
            clone.splice(index, 1);
            return clone;
        });
    };

    // SUBMIT FORM
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate cơ bản
        if (images.length < 3) return alert('Vui lòng tải lên ít nhất 3 ảnh minh họa');
        if (!form.category) return alert('Vui lòng chọn danh mục');
        if (!form.end_date) return alert('Vui lòng chọn thời gian kết thúc');
        if (Number(form.start_price) <= 0 || Number(form.step_price) <= 0) return alert('Giá tiền không hợp lệ');

        setSubmitting(true);

        try {
            const fd = new FormData();
            
            // Append Text Fields
            fd.append('name', form.name.trim());
            fd.append('category', form.category); 
            fd.append('seller', CURRENT_USER_ID); // <--- Tự động lấy ID user
            fd.append('description', form.description || '');
            fd.append('start_price', form.start_price);
            fd.append('step_price', form.step_price);
            if (form.buy_now_price) fd.append('buy_now_price', form.buy_now_price);
            fd.append('end_date', form.end_date);
            
            // Lưu ý: Không gửi 'status', backend tự set 'active'

            // Append Images
            images.forEach((it) => {
                if (it.file) fd.append('images', it.file);
            });

            // GỌI API (Lưu ý: Dùng /api/products nếu đã cấu hình Proxy chuẩn, hoặc full URL localhost:3000 nếu chưa)
            // Khuyên dùng Full URL khi đang debug lỗi mạng:
            const res = await fetch('http://127.0.0.1:3000/api/products', {
                method: 'POST',
                body: fd,
            });

            const text = await res.text();
            try {
                const data = JSON.parse(text);
                if (!res.ok) throw new Error(data.message || 'Lỗi server');
                
                alert('Đăng sản phẩm thành công!');
                
                // Reset Form
                setForm({ name: '', category: '', description: '', start_price: '', step_price: '', buy_now_price: '', end_date: '' });
                setImages([]);
                setDurationSelect('');
                
            } catch (jsonError) {
                console.error("Server response not JSON:", text);
                throw new Error("Lỗi phản hồi từ server (Check console)");
            }

        } catch (err: any) {
            console.error(err);
            alert('Lỗi: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // RENDER 
    return (
        <div className="min-h-screen bg-[#F9FAFB] py-10 px-4 font-sans text-gray-700">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Đăng sản phẩm đấu giá</h2>
                    <p className="text-sm text-gray-500 mt-1">Điền thông tin sản phẩm của bạn</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* SECTION 1: HÌNH ẢNH */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-1">Hình ảnh sản phẩm</h3>
                        <p className="text-xs text-gray-500 mb-6">Tải lên tối đa 10 ảnh. Ảnh đầu tiên sẽ là ảnh đại diện.</p>
                        
                        <div
                            onDrop={handleDrop}
                            onDragOver={e => e.preventDefault()}
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-64 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-yellow-400 transition duration-200 group"
                        >
                            <div className="mb-4 p-4 bg-gray-50 rounded-full group-hover:bg-white transition">
                                {/* Upload Icon SVG */}
                                <svg className="w-8 h-8 text-gray-400 group-hover:text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            </div>
                            <p className="font-medium text-gray-600">Kéo thả ảnh hoặc click để chọn</p>
                            <p className="text-xs text-gray-400 mt-2">PNG, JPG lên tới 10MB mỗi ảnh</p>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />

                        {/* Preview Grid */}
                        {images.length > 0 && (
                            <div className="mt-6 grid grid-cols-4 sm:grid-cols-5 gap-4">
                                {images.map((it, i) => (
                                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                                        <img src={it.preview} alt="preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); removeImageAt(i); }}
                                            className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-gray-500 hover:text-red-500 hover:bg-white shadow-sm transition"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* SECTION 2: THÔNG TIN SẢN PHẨM */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">Thông tin sản phẩm</h3>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Tên sản phẩm *</label>
                                <input 
                                    name="name" 
                                    value={form.name} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-yellow-200 focus:border-yellow-400 outline-none transition placeholder-gray-400" 
                                    placeholder="VD: Đồng hồ Rolex Submariner" 
                                    required 
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Danh mục *</label>
                                    <div className="relative">
                                        <select 
                                            name="category" 
                                            value={form.category} 
                                            onChange={handleChange as any} 
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-yellow-200 focus:border-yellow-400 outline-none appearance-none cursor-pointer" 
                                            required
                                        >
                                            <option value="">Chọn danh mục</option>
                                            {MOCK_CATEGORIES.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Giả lập ô Tình trạng để giống UI (Disabled vì mặc định là active)
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Tình trạng *</label>
                                    <div className="relative">
                                        <select disabled className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed appearance-none">
                                            <option>Mới / Active</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div> */}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Mô tả chi tiết *</label>
                                <textarea 
                                    name="description" 
                                    value={form.description} 
                                    onChange={handleChange} 
                                    rows={4} 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-yellow-200 focus:border-yellow-400 outline-none transition placeholder-gray-400 resize-none" 
                                    placeholder="Mô tả chi tiết về sản phẩm, tình trạng, nguồn gốc..."
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: THÔNG TIN GIÁ */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">Thông tin giá</h3>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Giá khởi điểm ($) <span className="text-red-500">*</span></label>
                                    <input 
                                        type="number" 
                                        name="start_price" 
                                        value={form.start_price} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 outline-none transition font-medium" 
                                        placeholder="VD: 100"
                                        required 
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Bước giá ($) <span className="text-red-500">*</span></label>
                                    <input 
                                        type="number" 
                                        name="step_price" 
                                        value={form.step_price} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 outline-none transition font-medium" 
                                        placeholder="VD: 10"
                                        required 
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Giá mua ngay ($)</label>
                                <input 
                                    type="number" 
                                    name="buy_now_price" 
                                    value={form.buy_now_price} 
                                    onChange={handleChange} 
                                    className={`w-full px-4 py-3 bg-white border rounded-xl text-gray-900 outline-none transition font-medium ${priceError ? 'border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100'}`}
                                    placeholder="Không bắt buộc"
                                    min="1"
                                />
                                {priceError ? (
                                    <p className="text-xs text-red-500 mt-2 ml-1 flex items-center gap-1">
                                        ⚠️ {priceError}
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-400 mt-2 ml-1">Người mua có thể mua ngay với giá này mà không cần đấu giá</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Thời gian đấu giá <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select 
                                        value={durationSelect} // Bind vào state '1', '3', '7'
                                        onChange={handleDurationChange} 
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 outline-none appearance-none cursor-pointer font-medium"
                                        required
                                    >
                                        <option value="">Chọn thời gian</option>
                                        <option value="1">1 Ngày</option>
                                        <option value="3">3 Ngày</option>
                                        <option value="7">7 Ngày</option>
                                        <option value="custom">Tùy chọn...</option>
                                    </select>
                                    
                                    {/* Icon mũi tên xuống */}
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>

                                {/* Input chọn ngày giờ tùy chỉnh chỉ hiện khi chọn 'custom' */}
                                {durationSelect === 'custom' && (
                                    <div className="mt-4 animate-fadeIn">
                                        <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Chọn ngày giờ kết thúc:</label>
                                        <input 
                                            type="datetime-local" 
                                            onChange={(e) => {
                                                const date = new Date(e.target.value);
                                                if(!isNaN(date.getTime())) setForm(prev => ({ ...prev, end_date: date.toISOString() }));
                                            }}
                                            min={new Date().toISOString().slice(0, 16)} // Chặn chọn ngày trong quá khứ
                                            className="w-full px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl text-gray-900 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 outline-none" 
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: THÔNG TIN VẬN CHUYỂN (VISUAL ONLY - Chưa map logic)
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">Thông tin vận chuyển</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Địa điểm *</label>
                                <input className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" placeholder="Hà Nội, Việt Nam" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Chi phí vận chuyển ($) *</label>
                                    <input className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white outline-none" placeholder="0 = Miễn phí" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Thời gian xử lý (ngày) *</label>
                                    <div className="relative">
                                        <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none outline-none">
                                            <option>Chọn thời gian</option>
                                            <option>1-2 ngày</option>
                                            <option>3-5 ngày</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> */}

                    {/* ACTIONS */}
                    <div className="flex items-center gap-4 pt-2">
                        <button 
                            type="button" 
                            onClick={() => window.location.reload()} 
                            className="px-8 py-3.5 rounded-full border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900 transition bg-white"
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className={`flex-1 py-3.5 rounded-full text-white font-bold shadow-lg shadow-yellow-200/50 transition transform active:scale-[0.99] ${submitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#EAB308] hover:bg-[#CA8A04]'}`}
                        >
                            {submitting ? 'Đang xử lý...' : 'Đăng sản phẩm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProduct;