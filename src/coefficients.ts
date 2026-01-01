
export interface CoefficientRow {
    minAge: number; // Inclusive
    maxAge: number; // Exclusive (minAge of next row)
    b_net: number;
    c_rate: number;
    d_rate_gross: number;
}

// Data from Foglio Informativo SF165A231115
export const COEFFICIENTS: CoefficientRow[] = [
    { minAge: 54.5, maxAge: 55.0, b_net: 1.31843539, c_rate: 0.00921235, d_rate_gross: 0.035 },
    { minAge: 54.0, maxAge: 54.5, b_net: 1.33620464, c_rate: 0.00933938, d_rate_gross: 0.035 },
    { minAge: 53.5, maxAge: 54.0, b_net: 1.35423845, c_rate: 0.00946830, d_rate_gross: 0.035 },
    { minAge: 53.0, maxAge: 53.5, b_net: 1.37254078, c_rate: 0.00959914, d_rate_gross: 0.035 },
    { minAge: 52.5, maxAge: 53.0, b_net: 1.39111561, c_rate: 0.00973193, d_rate_gross: 0.035 },
    { minAge: 52.0, maxAge: 52.5, b_net: 1.40996700, c_rate: 0.00986670, d_rate_gross: 0.035 },
    { minAge: 51.5, maxAge: 52.0, b_net: 1.42909907, c_rate: 0.01000347, d_rate_gross: 0.035 },
    { minAge: 51.0, maxAge: 51.5, b_net: 1.44851601, c_rate: 0.01014228, d_rate_gross: 0.035 },
    { minAge: 50.5, maxAge: 51.0, b_net: 1.46822205, c_rate: 0.01028315, d_rate_gross: 0.035 },
    { minAge: 50.0, maxAge: 50.5, b_net: 1.48822149, c_rate: 0.01042613, d_rate_gross: 0.035 },
    { minAge: 49.5, maxAge: 50.0, b_net: 1.50851871, c_rate: 0.01057123, d_rate_gross: 0.035 },
    { minAge: 49.0, maxAge: 49.5, b_net: 1.52911813, c_rate: 0.01071849, d_rate_gross: 0.035 },
    { minAge: 48.5, maxAge: 49.0, b_net: 1.60818064, c_rate: 0.01128369, d_rate_gross: 0.035 },
    { minAge: 48.0, maxAge: 48.5, b_net: 1.63208962, c_rate: 0.01145461, d_rate_gross: 0.0350 },
    { minAge: 47.5, maxAge: 48.0, b_net: 1.65638401, c_rate: 0.01162829, d_rate_gross: 0.0350 },
    { minAge: 47.0, maxAge: 47.5, b_net: 1.68107003, c_rate: 0.01180477, d_rate_gross: 0.0350 },
    { minAge: 46.5, maxAge: 47.0, b_net: 1.70615399, c_rate: 0.01198409, d_rate_gross: 0.0350 },
    { minAge: 46.0, maxAge: 46.5, b_net: 1.73164231, c_rate: 0.01216630, d_rate_gross: 0.0350 },
    { minAge: 45.5, maxAge: 46.0, b_net: 1.75754150, c_rate: 0.01235145, d_rate_gross: 0.0350 },
    { minAge: 45.0, maxAge: 45.5, b_net: 1.78385818, c_rate: 0.01253958, d_rate_gross: 0.0350 },
    { minAge: 44.5, maxAge: 45.0, b_net: 1.81059910, c_rate: 0.01273075, d_rate_gross: 0.0350 },
    { minAge: 44.0, maxAge: 44.5, b_net: 1.83777107, c_rate: 0.01292499, d_rate_gross: 0.0350 },
    { minAge: 43.5, maxAge: 44.0, b_net: 1.86538107, c_rate: 0.01312237, d_rate_gross: 0.0350 },
    { minAge: 43.0, maxAge: 43.5, b_net: 1.89343613, c_rate: 0.01332293, d_rate_gross: 0.0350 },
    { minAge: 42.5, maxAge: 43.0, b_net: 2.02243070, c_rate: 0.01424509, d_rate_gross: 0.0350 },
    { minAge: 42.0, maxAge: 42.5, b_net: 2.05535017, c_rate: 0.01448043, d_rate_gross: 0.0350 },
    { minAge: 41.5, maxAge: 42.0, b_net: 2.08884078, c_rate: 0.01471985, d_rate_gross: 0.0350 },
    { minAge: 41.0, maxAge: 41.5, b_net: 2.12291243, c_rate: 0.01496342, d_rate_gross: 0.0350 },
    { minAge: 40.5, maxAge: 41.0, b_net: 2.15757520, c_rate: 0.01521122, d_rate_gross: 0.0350 },
    { minAge: 40.0, maxAge: 40.5, b_net: 2.19283936, c_rate: 0.01546332, d_rate_gross: 0.0350 },
];

export function getCoefficients(ageAtSubscription: number) {
    // Find row where ageAtSubscription is >= minAge and < maxAge
    for (const row of COEFFICIENTS) {
        if (ageAtSubscription >= row.minAge && ageAtSubscription < row.maxAge) {
            return row;
        }
    }
    return null;
}
