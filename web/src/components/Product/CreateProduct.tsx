import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useUser } from "../../context/useUser";
import { apiUrl } from "../../config/api";
import { useNavigate } from "react-router-dom";

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
    const navigate = useNavigate();

    // State lưu danh mục
    const [categories, setCategories] = useState<{_id: string, name: string}[]>([]);
    const { user, token } = useUser();

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

    const handleDescriptionChange = (value: string) => {
        setForm(prev => ({ ...prev, description: value }));
    };

    // Xử lý chọn thời gian đấu giá
    const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value; 
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

    // Xử lý File 
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

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch(apiUrl('/api/categories'));
                
                if (!res.ok) throw new Error('Failed to fetch categories');
                
                const responseData = await res.json();

                if (responseData.success) {
                    setCategories(responseData.data);
                }
            } catch (error) {
                console.error("Lỗi lấy danh mục:", error);
            }
        };

        fetchCategories();
    }, []);


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
            const id = user?._id || user?.id || "";

            if (!id) {
                alert("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại!");
                return; 
            }
            const fd = new FormData();
            
            // Append Text Fields
            fd.append('name', form.name.trim());
            fd.append('category', form.category); 
            fd.append('seller', id); 
            fd.append('description', form.description || '');
            fd.append('start_price', form.start_price);
            fd.append('step_price', form.step_price);
            if (form.buy_now_price) fd.append('buy_now_price', form.buy_now_price);
            fd.append('end_date', form.end_date);
            
            

            // Append Images
            images.forEach((it) => {
                if (it.file) fd.append('images', it.file);
            });

            // GỌI API 
            
            const requestOptions: RequestInit = {
                method: 'POST',
                body: fd,
            };

            if (token) {
                requestOptions.headers = { Authorization: `Bearer ${token}` };
            }

            const res = await fetch(apiUrl('/api/products'), requestOptions);

            const text = await res.text();
            try {
                const data = JSON.parse(text);
                if (!res.ok) throw new Error(data.message || 'Lỗi server');
                
                alert('Đăng sản phẩm thành công!');
                
                // Reset Form
                setForm({ name: '', category: '', description: '', start_price: '', step_price: '', buy_now_price: '', end_date: '' });
                setImages([]);
                setDurationSelect('');

                navigate("/my-products"); 
                
            } catch (parseError) {
                console.error("Server response not JSON:", text, parseError);
                throw new Error("Lỗi phản hồi từ server (Check console)");
            }

        } catch (err) {
            if (err instanceof Error) {
                console.error(err);
                alert('Lỗi: ' + err.message);
            } else {
                console.error('Unexpected error during product creation', err);
                alert('Đã xảy ra lỗi không xác định');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // CONFIG TOOLBAR CHO QUILL 
    const quillModules = {
        toolbar: [
           [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }], 
            [{ 'list': 'ordered'}, {'list': 'bullet'}],
            [{ 'align': [] }], 
            ['clean']
        ],
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
                        <h3 className="font-semibold text-gray-900 mb-1">Hình ảnh sản phẩm <span className="text-red-500">*</span></h3>
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
                        <input
                            ref={fileInputRef}
                            id="product-image-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFiles}
                            className="hidden"
                            aria-label="Chọn ảnh sản phẩm"
                        />

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
                                            aria-label="Xóa ảnh"
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
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Tên sản phẩm <span className="text-red-500">*</span></label>
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
                                    <label htmlFor="product-category" className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Danh mục <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <select 
                                            id="product-category"
                                            name="category" 
                                            value={form.category} 
                                            onChange={handleChange} 
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:ring-2 focus:ring-yellow-200 focus:border-yellow-400 outline-none appearance-none cursor-pointer" 
                                            required
                                        >
                                            <option value="">Chọn danh mục</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat._id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Mô tả chi tiết </label>
                                <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-yellow-200 focus-within:border-yellow-400 transition">
                                    <ReactQuill 
                                        theme="snow"
                                        value={form.description}
                                        onChange={handleDescriptionChange}
                                        modules={quillModules}
                                        placeholder="Mô tả chi tiết về sản phẩm, tình trạng, nguồn gốc..."
                                        className="h-48 mb-12" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: THÔNG TIN GIÁ */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-6 border-b border-gray-100 pb-4">Thông tin giá</h3>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Giá khởi điểm <span className="text-red-500">*</span></label>
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
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Bước giá <span className="text-red-500">*</span></label>
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
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Giá mua ngay </label>
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
                                        {priceError}
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-400 mt-2 ml-1">Người mua có thể mua ngay với giá này mà không cần đấu giá</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="product-duration" className="block text-xs font-bold text-gray-700 mb-1.5 ml-1">Thời gian đấu giá <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select 
                                        id="product-duration"
                                        value={durationSelect} // Bind vào state '1', '3', '7'
                                        onChange={handleDurationChange} 
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-500 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 outline-none appearance-none cursor-pointer font-medium"
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
                                        <label htmlFor="product-custom-end" className="block text-xs font-bold text-gray-700 mb-1 ml-1">Chọn ngày giờ kết thúc <span className="text-red-500">*</span></label>
                                        <input 
                                            type="datetime-local" 
                                            id="product-custom-end"
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
                            className={`flex-1 py-3.5 rounded-full cursor-pointer text-white font-bold shadow-lg shadow-yellow-200/50 transition transform active:scale-[0.99] ${submitting ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#EAB308] hover:bg-[#CA8A04]'}`}
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