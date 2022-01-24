import * as dotenv from 'dotenv'
import fetch from 'cross-fetch'
import { MarkdownContentService } from './services/content'
const Twit = require('twit')

dotenv.config()

console.log("Tweet top resources")
run()

const EXCLUDE = ['https://github.com/wslyvh/useWeb3/tree/main/content']

async function run() {
    console.log('TOP')
    const service = new MarkdownContentService()
    
    const response = await fetch(`https://plausible.io/api/v1/stats/breakdown?site_id=useweb3.xyz&period=7d&property=event:props:url&filters=event:name==Outbound+Link%3A+Click`, {
        headers: { 'Authorization': `Bearer ${process.env.PLAUSIBLE_API_KEY}` },
    })
    
    const body = await response.json()
    const stats = body.results.map((i: any) => i.url).filter((i: any) => !EXCLUDE.includes(i)).splice(0, 5)
    const items = await service.GetItems()

    let text = `Most popular last week 🚀\n\n`
    for (let index = 0; index < stats.length; index++) {
        const resource = items.find(i => i.url === stats[index])
        if (resource) {
            text += `${index + 1}. ${resource.title} ${resource.authors.join(' ')} \n`
        }
    }

    const twitterClient = new Twit({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token: process.env.TWITTER_ACCESS_TOKEN,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    })
    try {
        twitterClient.post('statuses/update', { status: text }, function (err: any, data: any, response: any) {
            if (err) {
                console.log('Unable to post Twitter update..')
                console.error(err)
            }
            else { 
                console.log('Update posted to Twitter..')
                console.log(`https://twitter.com/useWeb3/status/${data.id_str}`)
            }
        })
    }
    catch(e) {
        console.log('Unable to post Twitter update..')
        console.error(e)
    }
}
