export type ServiceYear = 2020 | 2021 | 2022;
export type ServiceType = "Photography" |
 "VideoRecording" | 
 "BlurayPackage" | 
 "TwoDayEvent" | 
 "WeddingSession";

const serviceKindSelector = ( service: ServiceType)=>{
    return ({
        'Photography': 'main',
        'BlurayPackage': 'related',
        'WeddingSession': 'other',
        'VideoRecording': 'main',
        'TwoDayEvent': 'related'
    }as const)[service]
}

const appendIfNotExist = (services : ServiceType[], service: ServiceType)=>{
    if(services.includes(service)){
        return services;
    }
    return [...services, service]
}

const includesMain = (services : ServiceType[])=>services.some(s=>serviceKindSelector(s)==='main')

const selectService = (previouslySelectedServices: ServiceType[], service: ServiceType) => {
    const kind = serviceKindSelector(service);
    if(kind === 'main' || kind === 'other'){
        return appendIfNotExist(previouslySelectedServices, service);
    }
    if(kind === 'related' && includesMain(previouslySelectedServices)){
        return appendIfNotExist(previouslySelectedServices, service)
    }
    return previouslySelectedServices;
}

const deselectService = (previouslySelectedServices: ServiceType[], service: ServiceType) => {
    const kind = serviceKindSelector(service);
    if(kind === 'related' || kind==='other'){
        return previouslySelectedServices.filter(x=> x!==service)
    }
    if(kind === 'main'){
        const services = previouslySelectedServices.filter(x=> x!==service);
        if(includesMain(services)){
            return services;
        }
        return services.filter(s=> serviceKindSelector(s) !== 'related')
    }
    return previouslySelectedServices;
}

export const updateSelectedServices = (
    previouslySelectedServices: ServiceType[],
    action: { type: "Select" | "Deselect"; service: ServiceType }
) => {
    // prefer maps and if statements and smaller functions over massive switches (reducer style)(personal preferance) 
    // although open for criticsm
    const {type, service} = action;
    if(type === 'Select'){
        return selectService(previouslySelectedServices, service)
    }
    return deselectService(previouslySelectedServices, service)
};

export const calculatePrice = (selectedServices: ServiceType[], selectedYear: ServiceYear) => {
    const basePriceForService: Record<ServiceYear, Record<ServiceType, number>> ={
        '2020':{
            'BlurayPackage': 300,
            'Photography': 1700,
            'TwoDayEvent': 400,
            'VideoRecording': 1700,
            'WeddingSession': 600
        },
        '2021':{
            'BlurayPackage': 300,
            'Photography': 1800,
            'TwoDayEvent':400,
            'VideoRecording': 1800,
            'WeddingSession': 600
        },
        '2022':{
            'BlurayPackage': 300,
            'Photography': 1900,
            'TwoDayEvent': 400,
            'VideoRecording': 1900,
            'WeddingSession': 600
        }
    }

    const flags = {
        '2020':{
            'PhotoAndVideo': 2200,
            'WeddingWithPhoto': 300,
            'WeddingWithVideo': 300,
        },
        '2021':{
            'PhotoAndVideo': 2300,
            'WeddingWithPhoto': 300,
            'WeddingWithVideo': 300,
        },
        '2022':{
            'PhotoAndVideo': 2500,
            'WeddingWithPhoto': 0,
            'WeddingWithVideo': 300,
        }
    } as const
 
    const flagsForYear = flags[selectedYear];
    const basePriceForYear = basePriceForService[selectedYear]

    let mapped = selectedServices.map(service=> ({service,base:basePriceForYear[service],final: basePriceForYear[service], discounted: false}));


    if(selectedServices.includes('Photography') && selectedServices.includes('WeddingSession')){
        mapped = mapped.map(x=> (x.service === 'WeddingSession' && !x.discounted) ? ({...x, final: flagsForYear.WeddingWithPhoto,discounted:true}): x);
    }

    if(selectedServices.includes('VideoRecording') && selectedServices.includes('WeddingSession')){
        mapped = mapped.map(x=> (x.service === 'WeddingSession' && !x.discounted) ? ({...x, final: flagsForYear.WeddingWithVideo,discounted:true}): x);
    }

    if(selectedServices.includes('Photography') && selectedServices.includes('VideoRecording')){
        mapped = mapped.map(x=> ((x.service === 'VideoRecording' || x.service === 'Photography') && !x.discounted) ? ({...x, final: flagsForYear.PhotoAndVideo/2,discounted:true}): x);
    }

    const basePrice = mapped.map(x=>x.base).reduce((a,b)=> a+b,0);
    const finalPrice = mapped.map(x=>x.final).reduce((a,b)=> a+b,0);

    return { basePrice, finalPrice }
}