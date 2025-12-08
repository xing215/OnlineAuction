export interface Product {
    id: string;
    name: string;
    category: string; // ObjectId ref to Category
    category_name: string;
    seller: string; // ObjectId ref to User
    images: string[];
    description?: string;
    description_updates: {
        content: string;
        created_at: Date;
    }[];
    start_price: number;
    step_price: number;
    buy_now_price?: number;
    posted_at: Date;
    end_date: Date;
    status: "active" | "sold" | "expired";
    banned_bidders: string[]; // ObjectId refs to User
    createdAt: Date;
    updatedAt: Date;
    time_remaining?: number; // virtual
    current_price?: number;
    bid_count?: number;
    highest_bidder_name?: string;
}

export interface Bid {
    id: string;
    product: string; // ObjectId ref to Product
    user: string; // ObjectId ref to User
    price: number;
    is_auto_bid: boolean;
    maximum_bid_limit?: number;
    created_at: Date;
    masked_user_name?: string; // virtual
}

export interface CategoryTree {
    id: string;
    name: string;
    child: CategoryTree[];
}

export interface Category {
    id: string;
    name: string;
    parent_id?: string | undefined; // ObjectId ref to Category
    is_active: boolean;
    createdAt: Date;
    updatedAt: Date;
    icon?: string;
    product_count?: number;
}
export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export interface Feedback {
    score: 1 | -1;
    comment: string;
    created_at: Date;
}

export interface Message {
    id: string;
    sender: string; // ObjectId ref to User
    content: string;
    sent_at: Date;
}

export interface Order {
    id: string;
    product: string; // ObjectId ref to Product
    seller: string; // ObjectId ref to User
    winner: string; // ObjectId ref to User
    final_price: number;
    status: "pending" | "paid" | "shipped" | "completed" | "cancelled";
    shipping_address?: string;
    cancellation?: {
        by: string; // ObjectId ref to User
        reason: string;
        at: Date;
    };
    seller_feedback?: Feedback;
    winner_feedback?: Feedback;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
    is_fully_completed?: boolean; // virtual
}

export interface Otp {
    id: string;
    email: string;
    code: string;
    type: "register" | "forgot_password";
    expireAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductQuestion {
    id: string;
    product: string | { _id: string; name: string; images?: string[] }; // ObjectId ref to Product
    asker: string | { _id: string; full_name: string }; // ObjectId ref to User
    question: string;
    asked_at: Date | string;
    answer?: string | null;
    answered_at?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    masked_asker_name?: string;
}

export interface UpgradeRequest {
    id: string;
    user: string; // ObjectId ref to User
    reason: string;
    status: "pending" | "approved" | "rejected";
    admin_note: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface SocialAuth {
    provider: "google" | "facebook" | "github";
    provider_id: string;
    email: string;
}

export interface RatingSummary {
    positive_count: number;
    negative_count: number;
}

export interface SellerDetails {
    expiry_date?: Date;
    upgrade_request_id?: string; // ObjectId ref to UpgradeRequest
}

export interface User {
    id: string;
    full_name: string;
    email: string;
    password?: string;
    phone?: string;
    address: string;
    dob?: Date;
    role: "bidder" | "seller" | "admin";
    avatar: string;
    status: "unverified" | "active" | "locked";
    seller_details: SellerDetails;
    rating_summary: RatingSummary;
    watch_list: string[]; // ObjectId refs to Product
    social_auth: SocialAuth[];
    createdAt: Date;
    updatedAt: Date;
    rating_percentage?: number; // virtual
    rating_score?: string; // virtual
    is_valid_seller?: boolean; // virtual
}
