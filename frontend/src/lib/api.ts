import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ecoride_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Types ────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  token: string
  email: string
  name: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  department: string | null
  year: number | null
  trustScore: number
  ridesCompleted: number
  carbonCredits: number
  badge: string
  vehicleModel: string | null
  vehicleNumber: string | null
  bio: string | null
  preferences: string | null
  phoneNumber: string | null
  phoneVerified: boolean
  licenseVerified: boolean
  createdAt: string
}

export interface RideDto {
  id: string
  driverId: string
  driverName: string
  pickupZone: string
  departureTime: string
  availableSeats: number
  status: 'OPEN' | 'FULL' | 'COMPLETED' | 'CANCELLED'
  isSubscription: boolean
  createdAt: string
}

export interface MyRideDto {
  rideId: string
  role: 'DRIVER' | 'PASSENGER'
  participantStatus: 'REQUESTED' | 'CONFIRMED' | 'CANCELLED'
  driverId: string
  driverName: string
  pickupZone: string
  destination: string
  departureTime: string
  availableSeats: number
  rideStatus: 'OPEN' | 'FULL' | 'COMPLETED' | 'CANCELLED'
}

export interface CreateRideRequest {
  pickupZone: string
  destination: string
  departureTime: string   // ISO-8601
  availableSeats: number
  isSubscription?: boolean
  pricePerSeat?: number
}

export interface MatchResultDto {
  rideId: string
  driverName: string
  pickupZone: string
  destination: string
  departureTime: string
  availableSeats: number
  matchScore: number
}

export interface WalletDto {
  totalCredits: number
  totalCarbonSavedGrams: number
  totalCarbonSavedKg: number
  recentTransactions: {
    rideId: string
    carbonSavedGrams: number
    creditsEarned: number
    createdAt: string
  }[]
}

export interface CampusSummaryDto {
  totalCarbonSavedGrams: number
  totalCreditsIssued: number
  totalRides: number
}

export interface TrustProfileDto {
  userId: string
  name: string
  trustScore: number
  ridesCompleted: number
  badge: string
  uniqueRidePartners: number
  topConnections: { userId: string; name: string; mutualRides: number }[]
}

export interface PredictionDto {
  pickupZone: string
  suggestedDepartureTime: string
  confidenceRideCount: number
  dayOfWeek: string
  message: string
}

export interface SubscriptionDto {
  id: string
  pickupZone: string
  departureTime: string
  dayOfWeek: number
  dayName: string
  createdBy: string
  memberCount: number
}

export interface CreateSubscriptionRequest {
  pickupZone: string
  departureTime: string   // HH:mm
  dayOfWeek: number
}

export interface ConversationDto {
  peerId: string
  peerName: string
  peerDepartment: string | null
  peerYear: number | null
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

export interface ChatMessageDto {
  id: string
  senderId: string
  receiverId: string
  content: string
  read: boolean
  createdAt: string
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (body: { name: string; email: string; password: string; department?: string; year?: number }) =>
    api.post<{ data: TokenResponse }>('/auth/register', body).then(r => r.data.data),

  login: (body: { email: string; password: string }) =>
    api.post<{ data: TokenResponse }>('/auth/login', body).then(r => r.data.data),
}

export interface UpdateUserRequest {
  name: string
  department?: string
  year?: number
  vehicleModel?: string
  vehicleNumber?: string
  bio?: string
  preferences?: string
  phoneNumber?: string
  phoneVerified?: boolean
  licenseVerified?: boolean
}

// ── Users ────────────────────────────────────────────────────────────────────

export const userApi = {
  me: () => api.get<{ data: UserProfile }>('/users/me').then(r => r.data.data),
  getById: (id: string) => api.get<{ data: UserProfile }>(`/users/${id}`).then(r => r.data.data),
  update: (body: UpdateUserRequest) => api.patch<{ data: UserProfile }>('/users/me', body).then(r => r.data.data),
}

// ── Rides ────────────────────────────────────────────────────────────────────

export const rideApi = {
  create: (body: CreateRideRequest) =>
    api.post<{ data: RideDto }>('/rides', body).then(r => r.data.data),
  get: (id: string) =>
    api.get<{ data: RideDto }>(`/rides/${id}`).then(r => r.data.data),
  my: () =>
    api.get<{ data: MyRideDto[] }>('/rides/my').then(r => r.data.data),
  join: (id: string) =>
    api.post<{ message: string }>(`/rides/${id}/join`).then(r => r.data),
  complete: (id: string) =>
    api.post(`/rides/${id}/complete`).then(r => r.data),
  cancel: (id: string) =>
    api.post(`/rides/${id}/cancel`).then(r => r.data),
}

// ── Matching ─────────────────────────────────────────────────────────────────

export const matchApi = {
  find: (zone: string, destination: string, time: string) =>
    api.get<{ data: MatchResultDto[] }>('/rides/match', { params: { zone, destination, time } })
       .then(r => r.data.data),
}

// ── Carbon ───────────────────────────────────────────────────────────────────

export const carbonApi = {
  wallet: () => api.get<{ data: WalletDto }>('/wallet').then(r => r.data.data),
  campusSummary: () => api.get<{ data: CampusSummaryDto }>('/wallet/campus-summary').then(r => r.data.data),
}

// ── Trust ────────────────────────────────────────────────────────────────────

export const trustApi = {
  getProfile: (userId: string) =>
    api.get<{ data: TrustProfileDto }>(`/trust/${userId}`).then(r => r.data.data),
}

// ── Prediction ───────────────────────────────────────────────────────────────

export const predictionApi = {
  suggestions: () =>
    api.get<{ data: PredictionDto[] }>('/prediction/suggestions').then(r => r.data.data),
}

// ── Subscription ─────────────────────────────────────────────────────────────

export const subscriptionApi = {
  create: (body: CreateSubscriptionRequest) =>
    api.post<{ data: SubscriptionDto }>('/subscription', body).then(r => r.data.data),
  join: (id: string) =>
    api.post<{ data: SubscriptionDto }>(`/subscription/${id}/join`).then(r => r.data.data),
  myPools: () =>
    api.get<{ data: SubscriptionDto[] }>('/subscription/my').then(r => r.data.data),
}

// ── Messaging ────────────────────────────────────────────────────────────────

export const messageApi = {
  conversations: () =>
    api.get<{ data: ConversationDto[] }>('/messages/conversations').then(r => r.data.data),
  conversation: (peerId: string) =>
    api.get<{ data: ChatMessageDto[] }>(`/messages/${peerId}`).then(r => r.data.data),
  send: (peerId: string, content: string) =>
    api.post<{ data: ChatMessageDto }>(`/messages/${peerId}`, { content }).then(r => r.data.data),
}

export default api
