# Seed Backup — V1 (pre fuel-card feature)

Snapshot of `seed.ts` vehicle, transaction, and schedule data before the fuel-card / government vehicle feature was added.

---

## Vehicles (21 civilian, no government category, no fuel cards)

| License Number     | Type              | Make           | Model          | Year | Owner                  |
|--------------------|-------------------|----------------|----------------|------|------------------------|
| DHA-GA-11-1001     | MOTORCYCLE        | Bajaj          | Pulsar 150     | 2019 | Rahim Uddin *(owner)*  |
| DHA-GA-11-4001     | CAR               | Toyota         | Corolla        | 2020 | Rahim Uddin *(owner)*  |
| DHA-GA-11-5001     | MICROBUS          | Toyota         | HiAce          | 2017 | Rahim Uddin *(owner)*  |
| DHA-GA-11-1002     | MOTORCYCLE        | Hero           | Splendor Plus  | 2020 | Karim Hossain          |
| CHA-GA-11-2001     | MOTORCYCLE        | Yamaha         | FZS V3         | 2021 | Nadia Begum            |
| DHA-GA-11-3001     | CNG_AUTO_RICKSHAW | Bajaj          | RE CNG         | 2018 | Jalal Ahmed            |
| CHA-GA-11-3002     | CNG_AUTO_RICKSHAW | TVS            | King CNG       | 2017 | Faruk Miah             |
| DHA-GA-11-4002     | CAR               | Honda          | Civic          | 2019 | Monir Chowdhury        |
| SYL-GA-11-4003     | CAR               | Suzuki         | Swift          | 2022 | Roksana Islam          |
| DHA-GA-11-4004     | CAR               | Hyundai        | Tucson         | 2021 | Tanvir Rahman          |
| DHA-GA-11-5002     | MICROBUS          | Mitsubishi     | L300           | 2016 | Mina Transport         |
| DHA-GA-11-6001     | TRUCK             | Tata           | 407            | 2016 | Selim Transport Ltd    |
| CHA-GA-11-6002     | TRUCK             | Ashok Leyland  | Dost           | 2018 | Alam Brothers Logistics|
| DHA-GA-11-6003     | TRUCK             | Eicher         | Pro 1049       | 2020 | Rapid Cargo Ltd        |
| DHA-GA-11-7001     | BUS               | Hino           | AK1JRKA        | 2019 | Green Line Paribahan   |
| SYL-GA-11-7002     | BUS               | Tata           | LPO 1512       | 2020 | Ena Transport          |
| DHA-GA-11-1003     | MOTORCYCLE        | Suzuki         | Gixxer         | 2022 | Salma Akter            |
| DHA-GA-11-4005     | CAR               | Nissan         | Sunny          | 2020 | Shahidul Khan          |
| DHA-GA-11-6004     | TRUCK             | Isuzu          | NPR            | 2019 | Anwar Logistics        |
| CHA-GA-11-1004     | MOTORCYCLE        | Honda          | CB Hornet      | 2021 | Rubel Ahmed            |
| DHA-GA-11-3003     | CNG_AUTO_RICKSHAW | Bajaj          | RE CNG         | 2019 | Habib Miah             |
| SYL-GA-11-5003     | MICROBUS          | Nissan         | Urvan          | 2018 | Dhaka Express          |

---

## Distribution Rules (civilian only)

| Vehicle Type      | Max Liters | Restriction Days |
|-------------------|-----------|-----------------|
| MOTORCYCLE        | 4 L       | 3               |
| CNG_AUTO_RICKSHAW | 3 L       | 2               |
| CAR               | 10 L      | 3               |
| MICROBUS          | 15 L      | 3               |
| TRUCK             | 20 L      | 2               |
| BUS               | 30 L      | 2               |

---

## Day-one Eligibility States

**BLOCKED (8):** DHA-GA-11-1001, DHA-GA-11-5001, DHA-GA-11-7001, CHA-GA-11-3002, DHA-GA-11-4002, DHA-GA-11-1003, DHA-GA-11-4005, DHA-GA-11-6004

**ELIGIBLE (14):** DHA-GA-11-4001, DHA-GA-11-1002, CHA-GA-11-2001, DHA-GA-11-3001, SYL-GA-11-4003, DHA-GA-11-4004, DHA-GA-11-5002, DHA-GA-11-6001, CHA-GA-11-6002, DHA-GA-11-6003, SYL-GA-11-7002, CHA-GA-11-1004, DHA-GA-11-3003, SYL-GA-11-5003

---

## Seeded Accounts

| Role           | Email               | Password      |
|----------------|---------------------|---------------|
| Vehicle Owner  | owner@fuel.bd       | Owner@1234    |
| Pump Operator  | operator@fuel.bd    | Operator@1234 |
| Government Admin | admin@fuel.bd     | Admin@1234    |
