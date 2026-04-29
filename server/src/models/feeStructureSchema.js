const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema({
    structureName: { 
        type: String, 
        required: true, 
        unique: true 
    }, // e.g., "First Year AC Room"
    description: { 
        type: String,
        maxLength: 100
    },
    components: {
        admissionFee: { 
            type: Number, 
            default: 0 
        },
        securityDeposit: { 
            type: Number, 
            default: 0 
        },
        hostelFee: { 
            type: Number, 
            default: 0 
        },
    },
    totalAmount: { 
        type: Number, 
        // required: true 
    }
});

// Calculate totalAmount before saving
feeStructureSchema.pre('save', function(next) {
    const admissionFee = Number(this.components?.admissionFee || 0);
    const securityDeposit = Number(this.components?.securityDeposit || 0);
    const hostelFee = Number(this.components?.hostelFee || 0);

    this.components.admissionFee = admissionFee;
    this.components.securityDeposit = securityDeposit;
    this.components.hostelFee = hostelFee;
    this.totalAmount = admissionFee + securityDeposit + hostelFee;
    next();
});

const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);
module.exports = FeeStructure;
