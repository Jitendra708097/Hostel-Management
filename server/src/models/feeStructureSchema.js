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
    this.totalAmount = this.components.admissionFee + this.components.securityDeposit + this.components.hostelFee;
    next();
});

const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);
module.exports = FeeStructure;