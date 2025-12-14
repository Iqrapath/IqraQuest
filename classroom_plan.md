# Classroom Setup Plan

## 1. Backend Setup
- [ ] Create `ClassroomController`
    - `show(Booking $booking)`: Validates user is participant, returns view.
- [ ] Add Route in `web.php` (protected by auth).

## 2. Frontend Setup
- [ ] Install `simple-peer`.
- [ ] Create `Pages/Classroom/Index.tsx`.
- [ ] Create `VideoManager` hook/component to handle:
    - Capture Camera/Mic.
    - Signal "Offer" (Initiator).
    - Signal "Answer" (Receiver).
    - Render `<video>` streams.

## 3. Signaling (Reverb)
- [ ] Create `ClassroomSignal` event (for Offer/Answer/Candidate messages).
