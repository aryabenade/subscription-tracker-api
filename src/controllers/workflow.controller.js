import dayjs from "dayjs"
import { Subscription } from "../models/subscription.model.js"
import { sendReminderEmail } from "../utils/send-email.js"

//To use require syntax in module type js
import { createRequire } from "module"
const require = createRequire(import.meta.url)
const { serve } = require("@upstash/workflow/express")

const reminder = [7, 5, 2, 1]

const sendReminders = serve(async (context) => {
    //pass the subscription id from body to the context
    //extract the subscription id from context
    //fetch the subscription from db
    //check if sub exists check its status and return if its inactive
    //check the renewaldate and exit if it has passed 
    //start a loop
    //set the reminderDate on the basis of renewaldate
    //sleep until the reminderdate comes
    // trigger the workflow if its the same day

    const { subscriptionId } = context.requestPayload;

    const subscription = await fetchSubscription(context, subscriptionId)

    if (!subscription || subscription.status != "active") return;

    const renewalDate = dayjs(subscription.renewalDate);

    if (renewalDate.isBefore(dayjs())) {
        console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping Workflow`);
        return
    }
    //reminder =[7,5,2,1] the loop will run for each element
    for (const daysBefore of reminder) {

        //so for 7 the reminderDate = 7 days subtracted from the renewalDate
        const reminderDate = renewalDate.subtract(daysBefore, 'day')
        
        if (reminderDate.isAfter(dayjs())) {
            await sleepUntilReminder(context, `${daysBefore} days before`, reminderDate)
        }
        //if today's date is exactly equal to reminderDate
        if (dayjs().isSame(reminderDate, 'day')) {
            await TriggerReminder(context, `${daysBefore} days before reminder`, subscription)
        }
    }

})

const fetchSubscription = async (context, subscriptionId) => {
    return await context.run('get subscription', async () => {
        return await Subscription.findById(subscriptionId).populate('user', 'userName email')//states which fields to take from the User model
    })
}
// run and sleepUntil are upStash context functions that take a string and a callback functions as arguements

const sleepUntilReminder = async (context, label, date) => {
    console.log(`Sleeping until ${label} reminder at ${date}`);
    await context.sleepUntil(label, date.toDate()) //converted the dayjs object to Date object because upStash works with it only.
}

const TriggerReminder = async (context, label, subscription) => {
    return await context.run(label, async () => {
        console.log(`Triggering ${label}`);
        await sendReminderEmail({
            to: subscription.user.email,
            type: label,
            subscription
        })
    })
}

export { sendReminders }