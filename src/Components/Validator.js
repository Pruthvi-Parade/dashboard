export class Validator {
    static errorTab = "";
    static errorStatus = "";
    static errorsIn = [];

    constructor(value, fieldName=value, tab="details") {
        this.value = value
        this.fieldName = fieldName
        this.error = {errors: []}

        this.tab = tab
    }

    strip = () => {
        if (typeof this.value === "string") {
            this.value = this.value.replace(/^\s+|\s+$|\s+(?=\s)/g, "")
        }
        return this
    }

    number = (msg=`Invalid ${this.fieldName} !`, gt=0, lt=null) => {
        if (isNaN(this.value)) {
            this.error.errors.push({
                msg: msg,
                type: "number",
            })
        }
        if (this.value <= gt) {
            this.error.errors.push({
                msg: `${this.fieldName} must be greater than ${gt}`,
                type: "gt",
            })
        }
        if (lt && this.value > lt) {
            this.error.errors.push({
                msg: `${this.fieldName} must be less than ${lt}`,
                type: "lt",
            })
        }
        return this
    }

    req = (msg=`${this.fieldName} required !`, min=1) => {
        if(min === 1) {
            msg = `${this.fieldName} required !`;
        }
        else if(min > 1) {
            msg = `${this.fieldName} required at least ${min} characters !`;
        }

        if (!this.value) {
            this.error.errors.push({
                msg: msg,
                type: "req",
            })

            return this;
        }

        if(this.value.length < min) {
            this.error.errors.push({
                msg: msg,
                type: "required"
            })
        }
        else{
            // console.log("this.value.length", this.value.length, min)
        }
        return this
    }

    // option => this is the id of any option in the select box
    opt = (msg=`${this.fieldName} required !`) => {
        if(!this.value || this.value <= 0) {
            this.error.errors.push({
                msg: msg,
                type: "required"
            })
        }
        return this
    }


    regex = (reg, msg=`Invalid ${this.fieldName} !`) => {
        const regex = RegExp(reg);
        if (!regex.test(this.value)) {
            this.error.errors.push({
                msg: msg,
                type: "regex",
            })
        }
        return this
    }

    email = (msg=`Invalid Email`) => {
        // validation for email using regex
        const regex = RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/);
        if(!regex.test(this.value)) {
            this.error.errors.push({
                msg: msg,
                type: "email"
            })
        }
        return this
    }

    ipAddr = (msg=`Invalid IP Address`) => {
        // validation for ip address using regex
        const regex = RegExp(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/);
        if(!regex.test(this.value)) {
            this.error.errors.push({
                msg: msg,
                type: "ip address"
            })
        }
        return this
    }


    v = () => {
        if (this.error.errors.length > 0) {
            console.log("Error in field !", this.fieldName)
            if(Validator.errorStatus !== "error") {
                Validator.errorTab = this.tab;
                Validator.errorStatus = "error";
            }
            Validator.errorsIn.push(this.fieldName);

            this.error.msg = this.error.errors[0].msg
            this.error.fieldName = this.fieldName
        }
        return this;
    }
}
