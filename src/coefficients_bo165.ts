
export interface CoefficientRow {
    startAge: number;
    endAge: number;
    c_rate: number;      // Coefficiente Rata (Tabella C)
    d_rate_gross: number; // Tasso Rendimento Lordo (Tabella D)
}

// Table C (c_rate) and Table D (d_rate_gross) for BO165A
// Source: BO165A201118-241221.pdf
export const COEFFICIENTS_BO165A: CoefficientRow[] = [
    { startAge: 54.5, endAge: 55.5, c_rate: 0.00705198, d_rate_gross: 0.0225 },
    { startAge: 54, endAge: 54.5, c_rate: 0.00708372, d_rate_gross: 0.0225 },
    { startAge: 53.5, endAge: 54, c_rate: 0.00711561, d_rate_gross: 0.0225 },
    { startAge: 53, endAge: 53.5, c_rate: 0.00714767, d_rate_gross: 0.0225 },
    { startAge: 52.5, endAge: 53, c_rate: 0.00717988, d_rate_gross: 0.0225 },
    { startAge: 52, endAge: 52.5, c_rate: 0.00721226, d_rate_gross: 0.0225 },
    { startAge: 51.5, endAge: 52, c_rate: 0.00724479, d_rate_gross: 0.0225 },
    { startAge: 51, endAge: 51.5, c_rate: 0.00727749, d_rate_gross: 0.0225 },
    { startAge: 50.5, endAge: 51, c_rate: 0.00731035, d_rate_gross: 0.0225 },
    { startAge: 50, endAge: 50.5, c_rate: 0.00734338, d_rate_gross: 0.0225 },
    { startAge: 49.5, endAge: 50, c_rate: 0.00737657, d_rate_gross: 0.0225 },
    { startAge: 49, endAge: 49.5, c_rate: 0.00740993, d_rate_gross: 0.0225 },
    { startAge: 48.5, endAge: 49, c_rate: 0.00752281, d_rate_gross: 0.0230 },
    { startAge: 48, endAge: 48.5, c_rate: 0.00755860, d_rate_gross: 0.0230 },
    { startAge: 47.5, endAge: 48, c_rate: 0.00759457, d_rate_gross: 0.0230 },
    { startAge: 47, endAge: 47.5, c_rate: 0.00763073, d_rate_gross: 0.0230 },
    { startAge: 46.5, endAge: 47, c_rate: 0.00766708, d_rate_gross: 0.0230 },
    { startAge: 46, endAge: 46.5, c_rate: 0.00770363, d_rate_gross: 0.0230 },
    { startAge: 45.5, endAge: 46, c_rate: 0.00774036, d_rate_gross: 0.0230 },
    { startAge: 45, endAge: 45.5, c_rate: 0.00777729, d_rate_gross: 0.0230 },
    { startAge: 44.5, endAge: 45, c_rate: 0.00791235, d_rate_gross: 0.0235 },
    { startAge: 44, endAge: 44.5, c_rate: 0.00795198, d_rate_gross: 0.0235 },
    { startAge: 43.5, endAge: 44, c_rate: 0.00799182, d_rate_gross: 0.0235 },
    { startAge: 43, endAge: 43.5, c_rate: 0.00803188, d_rate_gross: 0.0235 },
    { startAge: 42.5, endAge: 43, c_rate: 0.00807216, d_rate_gross: 0.0235 },
    { startAge: 42, endAge: 42.5, c_rate: 0.00811266, d_rate_gross: 0.0235 },
    { startAge: 41.5, endAge: 42, c_rate: 0.00815338, d_rate_gross: 0.0235 },
    { startAge: 41, endAge: 41.5, c_rate: 0.00819433, d_rate_gross: 0.0235 },
    { startAge: 40.5, endAge: 41, c_rate: 0.00823550, d_rate_gross: 0.0235 },
    { startAge: 40, endAge: 40.5, c_rate: 0.00827689, d_rate_gross: 0.0235 },
    { startAge: 39.5, endAge: 40, c_rate: 0.00831852, d_rate_gross: 0.0235 },
    { startAge: 39, endAge: 39.5, c_rate: 0.00836037, d_rate_gross: 0.0235 },
    { startAge: 38.5, endAge: 39, c_rate: 0.00840245, d_rate_gross: 0.0235 },
    { startAge: 38, endAge: 38.5, c_rate: 0.00844476, d_rate_gross: 0.0235 },
    { startAge: 37.5, endAge: 38, c_rate: 0.00848731, d_rate_gross: 0.0235 },
    { startAge: 37, endAge: 37.5, c_rate: 0.00853009, d_rate_gross: 0.0235 },
    { startAge: 36.5, endAge: 37, c_rate: 0.00857310, d_rate_gross: 0.0235 },
    { startAge: 36, endAge: 36.5, c_rate: 0.00861635, d_rate_gross: 0.0235 },
    { startAge: 35.5, endAge: 36, c_rate: 0.00865983, d_rate_gross: 0.0235 },
    { startAge: 35, endAge: 35.5, c_rate: 0.00870356, d_rate_gross: 0.0235 },
    { startAge: 34.5, endAge: 35, c_rate: 0.00874752, d_rate_gross: 0.0235 },
    { startAge: 34, endAge: 34.5, c_rate: 0.00879172, d_rate_gross: 0.0235 },
    { startAge: 33.5, endAge: 34, c_rate: 0.00883617, d_rate_gross: 0.0235 },
    { startAge: 33, endAge: 33.5, c_rate: 0.00888086, d_rate_gross: 0.0235 },
    { startAge: 32.5, endAge: 33, c_rate: 0.00908868, d_rate_gross: 0.0240 },
    { startAge: 32, endAge: 32.5, c_rate: 0.00913684, d_rate_gross: 0.0240 },
    { startAge: 31.5, endAge: 32, c_rate: 0.00918528, d_rate_gross: 0.0240 },
    { startAge: 31, endAge: 31.5, c_rate: 0.00923400, d_rate_gross: 0.0240 },
    { startAge: 30.5, endAge: 31, c_rate: 0.00928300, d_rate_gross: 0.0240 },
    { startAge: 30, endAge: 30.5, c_rate: 0.00933228, d_rate_gross: 0.0240 },
    { startAge: 29.5, endAge: 30, c_rate: 0.00938185, d_rate_gross: 0.0240 },
    { startAge: 29, endAge: 29.5, c_rate: 0.00943169, d_rate_gross: 0.0240 },
    { startAge: 28.5, endAge: 29, c_rate: 0.00948183, d_rate_gross: 0.0240 },
    { startAge: 28, endAge: 28.5, c_rate: 0.00953225, d_rate_gross: 0.0240 },
    { startAge: 27.5, endAge: 28, c_rate: 0.00958296, d_rate_gross: 0.0240 },
    { startAge: 27, endAge: 27.5, c_rate: 0.00963396, d_rate_gross: 0.0240 },
    { startAge: 26.5, endAge: 27, c_rate: 0.00968525, d_rate_gross: 0.0240 },
    { startAge: 26, endAge: 26.5, c_rate: 0.00973684, d_rate_gross: 0.0240 },
    { startAge: 25.5, endAge: 26, c_rate: 0.00978872, d_rate_gross: 0.0240 },
    { startAge: 25, endAge: 25.5, c_rate: 0.00984090, d_rate_gross: 0.0240 },
    { startAge: 24.5, endAge: 25, c_rate: 0.01011248, d_rate_gross: 0.0245 },
    { startAge: 24, endAge: 24.5, c_rate: 0.01016887, d_rate_gross: 0.0245 },
    { startAge: 23.5, endAge: 24, c_rate: 0.01022558, d_rate_gross: 0.0245 },
    { startAge: 23, endAge: 23.5, c_rate: 0.01028264, d_rate_gross: 0.0245 },
    { startAge: 22.5, endAge: 23, c_rate: 0.01034004, d_rate_gross: 0.0245 },
    { startAge: 22, endAge: 22.5, c_rate: 0.01039778, d_rate_gross: 0.0245 },
    { startAge: 21.5, endAge: 22, c_rate: 0.01045587, d_rate_gross: 0.0245 },
    { startAge: 21, endAge: 21.5, c_rate: 0.01051430, d_rate_gross: 0.0245 },
    { startAge: 20.5, endAge: 21, c_rate: 0.01108987, d_rate_gross: 0.0255 },
    { startAge: 20, endAge: 20.5, c_rate: 0.01115727, d_rate_gross: 0.0255 },
    { startAge: 19.5, endAge: 20, c_rate: 0.01122510, d_rate_gross: 0.0255 },
    { startAge: 19, endAge: 19.5, c_rate: 0.01129338, d_rate_gross: 0.0255 },
    { startAge: 18.5, endAge: 19, c_rate: 0.01136210, d_rate_gross: 0.0255 },
    { startAge: 18, endAge: 18.5, c_rate: 0.01143126, d_rate_gross: 0.0255 },
];

export function getCoefficientsBO165A(ageAtSubscription: number) {
    // Find row where ageAtSubscription matches [startAge, endAge)
    for (const row of COEFFICIENTS_BO165A) {
        if (ageAtSubscription >= row.startAge && ageAtSubscription < row.endAge) {
            return row;
        }
    }
    return null;
}
