import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter subscription name"],
        minLength: 4,
        maxLength: 20,
    },
    price: {
        type: Number,
        required: [true, "Please enter subscription price"],
        validate: {
            validator: (val) => val > 0,
            message: "Price must be greater than 0"
        },
    },
    currency: {
        type: String,
        required: [true, "Please enter your currency"],
        enum: ["INR", "USD"]
    },
    frequency: {
        type: String,
        required: [true, "Please enter subscription frequency"],
        enum: ["daily", "weekly", "monthly", "yearly"],
        minLength: 4,
        maxLength: 20,
    },
    startDate: {
        type: Date,
        required: [true, "Please enter the start date"],
        validate: {
            validator: (val) => val <= new Date(),
            message: "Start Date must be in the past"
        }
    },
    renewalDate: {
        type: Date,
        validate: {
            validator: function (val) {
                return val > this.startDate
            },
            message: "Renewal date must be after the start date"
        }
    },
    status: {
        type: String,
        enum: ["active", "cancelled", "expired"],
        default: "active"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    }
}, { timestamps: true })

subscriptionSchema.pre("save", function () {
    //check if the renewaldate is missing
    //list the frequency object with days
    //set the this.renewal date to start date 
    //(We cant directly assign the start date, instead we should send a copy otherwise 
    //any changes we do in the renewaldate will be applied to the startDate as well)
    //set the renewal date to renewaldate + days in frequency object
    //set the status to expired if the renewaldate has passed 
    //next()

    //Auto calculate the renewal date if missing 
    if (!this.renewalDate) {
        const renewalPeriods = {
            "daily": 1,
            "weekly": 7,
            "monthly": 30,
            "yearly": 365
        }

        this.renewalDate = new Date(this.startDate)
        this.renewalDate.setDate(this.renewalDate.getDate() + renewalPeriods[this.frequency])
    }

    //Auto calculate the status if missing
    if (this.renewalDate < new Date()) {
        this.status = "expired"
    }

    // next()
})

export const Subscription = mongoose.model("Subscription", subscriptionSchema)