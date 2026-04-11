pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

// Simple age verification circuit: proves age >= minAge
// This is the Phase 1 test circuit to validate the full pipeline
template AgeCheck() {
    signal input age;       // private: user's actual age
    signal input minAge;    // public: minimum age requirement

    component gte = GreaterEqThan(8); // 8-bit, supports ages 0-255
    gte.in[0] <== age;
    gte.in[1] <== minAge;

    // Constrain: age must be >= minAge
    gte.out === 1;
}

component main {public [minAge]} = AgeCheck();
