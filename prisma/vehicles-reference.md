# Vehicle Registry — Seed Reference

All vehicles currently seeded in the system. Government vehicles always have a fuel card. Civilian vehicles optionally have one.

---

## Government Vehicles

All government vehicles are enrolled with a mandatory fuel card and use the **Government Quota** (higher limits, shorter restriction window).

| License Plate     | Type     | Make / Model              | Year | Department              | Fuel Card     |
|-------------------|----------|---------------------------|------|-------------------------|---------------|
| GOVT-DHA-CAR-001  | CAR      | Toyota Land Cruiser       | 2022 | Ministry of Finance     | FC-GOVT-0001  |
| GOVT-DHA-CAR-002  | CAR      | Mitsubishi Pajero         | 2021 | Ministry of Health      | FC-GOVT-0002  |
| GOVT-DHA-CAR-003  | CAR      | Toyota Prado              | 2020 | Ministry of Education   | FC-GOVT-0003  |
| GOVT-DHA-MCB-001  | MICROBUS | Toyota HiAce (Police)     | 2021 | Bangladesh Police       | FC-GOVT-0004  |
| GOVT-DHA-MCB-002  | MICROBUS | Mitsubishi Rosa           | 2020 | Bangladesh Army         | FC-GOVT-0005  |
| GOVT-DHA-TRK-001  | TRUCK    | Tata LPT 2518             | 2019 | Bangladesh Army         | FC-GOVT-0006  |

---

## Civilian Vehicles — With Fuel Card

These civilian vehicles have been issued a fuel card (can be looked up by card or by plate).

| License Plate    | Type     | Make / Model        | Year | Owner                  | Fuel Card    |
|------------------|----------|---------------------|------|------------------------|--------------|
| DHA-GA-11-4001   | CAR      | Toyota Corolla      | 2020 | Rahim Uddin (owner)    | FC-CIV-4001  |
| # DHA-GA-11-4002   | CAR      | Honda Civic         | 2019 | Monir Chowdhury        | FC-CIV-4002  |
| DHA-GA-11-6001   | TRUCK    | Tata 407            | 2016 | Selim Transport Ltd    | FC-CIV-6001  |

---

## Civilian Vehicles — No Fuel Card

These vehicles can only be looked up by license plate (suitable for future YOLO plate detection).

| License Plate    | Type              | Make / Model              | Year | Owner                    |
|------------------|-------------------|---------------------------|------|--------------------------|
| DHA-GA-11-1001   | MOTORCYCLE        | Bajaj Pulsar 150          | 2019 | Rahim Uddin (owner)      |
| DHA-GA-11-5001   | MICROBUS          | Toyota HiAce              | 2017 | Rahim Uddin (owner)      |
| DHA-GA-11-1002   | MOTORCYCLE        | Hero Splendor Plus        | 2020 | Karim Hossain            |
| CHA-GA-11-2001   | MOTORCYCLE        | Yamaha FZS V3             | 2021 | Nadia Begum              |
| DHA-GA-11-3001   | CNG_AUTO_RICKSHAW | Bajaj RE CNG              | 2018 | Jalal Ahmed              |
| CHA-GA-11-3002   | CNG_AUTO_RICKSHAW | TVS King CNG              | 2017 | Faruk Miah               |
| SYL-GA-11-4003   | CAR               | Suzuki Swift              | 2022 | Roksana Islam            |
| DHA-GA-11-4004   | CAR               | Hyundai Tucson            | 2021 | Tanvir Rahman            |
| DHA-GA-11-5002   | MICROBUS          | Mitsubishi L300           | 2016 | Mina Transport           |
| CHA-GA-11-6002   | TRUCK             | Ashok Leyland Dost        | 2018 | Alam Brothers Logistics  |
| DHA-GA-11-6003   | TRUCK             | Eicher Pro 1049           | 2020 | Rapid Cargo Ltd          |
| DHA-GA-11-7001   | BUS               | Hino AK1JRKA              | 2019 | Green Line Paribahan     |
| SYL-GA-11-7002   | BUS               | Tata LPO 1512             | 2020 | Ena Transport            |
| DHA-GA-11-1003   | MOTORCYCLE        | Suzuki Gixxer             | 2022 | Salma Akter              |
| DHA-GA-11-4005   | CAR               | Nissan Sunny              | 2020 | Shahidul Khan            |
| DHA-GA-11-6004   | TRUCK             | Isuzu NPR                 | 2019 | Anwar Logistics          |
| CHA-GA-11-1004   | MOTORCYCLE        | Honda CB Hornet           | 2021 | Rubel Ahmed              |
| DHA-GA-11-3003   | CNG_AUTO_RICKSHAW | Bajaj RE CNG              | 2019 | Habib Miah               |
| SYL-GA-11-5003   | MICROBUS          | Nissan Urvan              | 2018 | Dhaka Express            |

---

## Fuel Quota Rules

### Civilian (Distribution Rules)

| Vehicle Type      | Max Liters | Restriction Days |
|-------------------|-----------|-----------------|
| MOTORCYCLE        | 4 L       | 3 days          |
| CNG_AUTO_RICKSHAW | 3 L       | 2 days          |
| CAR               | 10 L      | 3 days          |
| MICROBUS          | 15 L      | 3 days          |
| TRUCK             | 20 L      | 2 days          |
| BUS               | 30 L      | 2 days          |

### Government (Government Quota Rules)

| Vehicle Type      | Max Liters | Restriction Days |
|-------------------|-----------|-----------------|
| MOTORCYCLE        | 6 L       | 2 days          |
| CNG_AUTO_RICKSHAW | 5 L       | 1 day           |
| CAR               | 20 L      | 2 days          |
| MICROBUS          | 30 L      | 2 days          |
| TRUCK             | 40 L      | 1 day           |
| BUS               | 50 L      | 1 day           |

---

## Test Accounts

| Role            | Email               | Password      |
|-----------------|---------------------|---------------|
| Admin           | admin@fuel.bd       | Admin@1234    |
| Vehicle Owner   | owner@fuel.bd       | Owner@1234    |
| Pump Operator   | operator@fuel.bd    | Operator@1234 |

*The owner account (Rahim Uddin) owns: DHA-GA-11-1001, DHA-GA-11-4001 (FC-CIV-4001), DHA-GA-11-5001.*
