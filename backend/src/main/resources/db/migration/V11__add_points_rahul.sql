-- V11: Add 220 display-points (2 200 credits) to Rahul Verma's wallet
-- Before: 510 credits (51 pts)  →  After: 2 710 credits (271 pts)

UPDATE users
SET carbon_credits = carbon_credits + 2200
WHERE email = 'rahul.verma@campus.edu';
