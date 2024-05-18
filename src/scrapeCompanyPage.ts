import { CheerioCrawler, RequestList} from 'crawlee';
import * as fs from 'fs'
import { base_url } from './utils/constants';
import { JSON_OUTPUT_PATH } from './resources';
import { Company, Founder, Job, News, Posts, Post } from './utils/types';
import { AnyNode, BasicAcceptedElems, Cheerio } from 'cheerio';

export async function scrapeCompanyPage(companies: any) {
    
    /**
     * My first approach was creating router, but debugging was time taking
     * due to some error, so I approached with creating a object for CheerioCrawler
     * and declaring a requesthandler function
     */


    /**
     * Below is the pseudo code I was trying for router, 
     * then there is the main code, where I use requesthandler for scraping all pages
     * it can be cleaner with more time, but I felt the race against time and did the required
     * 
     * I c
     */
    // const request  = new Request({url});
    // const router = createCheerioRouter();

    // router.addHandler("null",
    //     async ({$,request}) => {
    //         const companyName = $('.shared-breadcrumb-text:not(a)').text()
    //         request.log.info('...', companyName);
    //     });
    const companiesData: Company[] = []
    const requestList = await RequestList.open(null,companies)
    const crawler  = new CheerioCrawler({
        requestList: requestList,
        // requestHandler: router
        /**
         * requestHandler handles all the links and these links are use to run the
         * crawler, from where we get all our info
         */
        async requestHandler({$ , request}){
            
            /**
             * scrapedInfo is specific to each company we scrap
             */
           
            const companyName = $('.shared-breadcrumb-text:not(a)').text();
            const scrapedInfo: Company = {
                name: companyName,
                url: request.url
            };

            const founders : Founder[]=[];
            ($(".leading-snug") as Cheerio<AnyNode>)
                .find('.font-bold')
                .each((_index: number, element:BasicAcceptedElems<AnyNode> ) => {
                    const name = $(element).text();
                    const founder: Founder = {
                        name: name
                    };
                    founders.push(founder)
                });

            ($(".leading-snug")as any)
                .find(".inline-block.h-5.w-5.bg-contain.bg-image-linkedin")
                .each((index: number, element: BasicAcceptedElems<AnyNode> ) => {
                    const linkedIn = $(element).attr('href')
                    founders[index].linkedIn = linkedIn;
                });
            

            /**
             * special case : if founders have description about themselves
             */

            ($('.prose.max-w-full.whitespace-pre-line') as Cheerio<AnyNode> )
                .each((index:number, element: BasicAcceptedElems<AnyNode>) => {
                    if(founders[index]!= undefined)
                    founders[index].about = $(element).text().trim()
                });
            scrapedInfo.founders = founders;

            ($('.flex.flex-row.justify-between') as Cheerio<AnyNode>)
            .each((index: number, element: BasicAcceptedElems<AnyNode>) => {
                if($(element).find("span").eq(0).text() == "Founded:")
                {
                    scrapedInfo.foundedYear = $(element).find("span").eq(1).text();
                }
                if($(element).find("span").eq(0).text() == "Team Size:")
                {
                    scrapedInfo.teamSize = Number($(element).find("span").eq(1).text());
                }
                if($(element).find("span").eq(0).text() == "Location:")
                {
                    scrapedInfo.location = $(element).find("span").eq(1).text();
                }
            });

            scrapedInfo.description = $('p.whitespace-pre-line').text().trim();


           ($('.flex.w-full.flex-row.justify-between.py-4') as Cheerio<AnyNode>)
                .each((index: number, jobListing: BasicAcceptedElems<AnyNode>) => {
                    const jobTitleElement = $(jobListing).find('.ycdc-with-link-color a');
                    const jobInfo : Job= {
                        role: jobTitleElement.text().trim(),
                    }
                    
                    jobInfo.link = base_url + jobTitleElement.attr('href');
                    // Extract location(s) (assuming details are in the first '.list-item' element)
                    const locationElement = $(jobListing).find('.list-item.list-square:first-child');

                    // Extract individual locations from the details string (optional)
                    const locations =locationElement.text().trim()?.split(' / '); // Split by "/" delimiter
                    jobInfo.locations = locations; // Store locations as an array
                    scrapedInfo.jobs?scrapedInfo.jobs.push(jobInfo):scrapedInfo.jobs =[jobInfo]
                })
            
            const newsList: News[] = [];
            ($('#news > div:nth-child(2) > div:nth-child(1)') as Cheerio<AnyNode>)
                .each((index: number, element: BasicAcceptedElems<AnyNode>) => {
                    const titleElement = $(element).find(".ycdc-with-link-color.mb-1.pr-4.leading-none")
                                                    .find('a')
                    const newsInfo: News = {
                        title: titleElement.text().trim(),
                        link: titleElement.attr("href")
                    }
                    const dateELement = $(element).find('.mb-4.text-sm');
                    newsInfo.date = dateELement.text().trim()
                    newsList.push(newsInfo);
                })
            scrapedInfo.latestNews = newsList;
            

            const imageURL: string | undefined = $('div.flex-grow > div.mb-5.flex.flex-row.items-center.gap-x-5 > div.h-32.w-32.shrink-0.clip-circle-32 > img').attr("src");
            scrapedInfo.imageURL = imageURL;
            
            
            const posts : Posts = {
                lauchLink: base_url + $('a.ycdc-with-link-color.mb-4.mt-0.text-xl.underline').attr("href")
            }
            let post: Post = {};

            ($('.prose.max-w-full > div')as Cheerio<AnyNode>)
            .find('h1, h2, h3, h4, h5, h6, p')
            .each((index: number, element: BasicAcceptedElems<AnyNode>) => {
                if($(element).is('h1, h2, h3, h4, h5, h6')){
                    if(post.title){
                        posts.postsList?posts.postsList.push(post):posts.postsList = [post]
                        post = {}
                    }
                    const title = $(element).text().trim();
                    post.title = title
                }
                else {
                    ($(element)as Cheerio<AnyNode>).each((i:number, e: BasicAcceptedElems<AnyNode>) => {
                        const ele = $(e)
                        ele
                            .find('a')
                            .each((ia: number, ea : BasicAcceptedElems<AnyNode>) => {
                                const ele_a = $(ea)
                                post.links?post.links.push((ele_a.attr('href') as string)):post.links = [(ele_a.attr('href')as string)]
                            })
                        ele
                            .find('img')
                            .each((im : number, em: BasicAcceptedElems<AnyNode>) => {
                                const ele_m = $(em)
                                post.imageLinks?post.imageLinks.push(base_url +ele_m.attr('src')):post.imageLinks = [base_url+ele_m.attr('src')]
                            })
                        ele
                            .find('iframe')
                            .each((ifr: number, ef: BasicAcceptedElems<AnyNode>) => {
                                const ele_f = $(ef)
                                post.videoLinks?post.videoLinks.push(base_url +ele_f.attr('src')):post.videoLinks = [base_url+ele_f.attr('src')]
                            })
                            post.details? post.details.push(ele.text().trim()):post.details = [ele.text().trim()]
                    })
                }
            })
            scrapedInfo.posts = posts
            console.log(scrapedInfo)
            companiesData.push(scrapedInfo)
        }
    });
   await crawler.run();
   const jsonString = JSON.stringify({companiesData});
   await fs.promises.writeFile(JSON_OUTPUT_PATH, jsonString,'utf-8' )
}