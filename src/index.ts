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
    if(kind === 'main'){
        return appendIfNotExist(previouslySelectedServices, service);
    }
    if(kind === 'related' && includesMain(previouslySelectedServices)){
        return appendIfNotExist(previouslySelectedServices, service)
    }
    return previouslySelectedServices;
}

const deselectService = (previouslySelectedServices: ServiceType[], service: ServiceType) => {
    const kind = serviceKindSelector(service);
    if(kind === 'related'){
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
    const {type, service} = action;
    if(type === 'Select'){
        return selectService(previouslySelectedServices, service)
    }
    return deselectService(previouslySelectedServices, service)
};

export const calculatePrice = (selectedServices: ServiceType[], selectedYear: ServiceYear) => {
    const basePriceForService: Record<ServiceYear, Record<ServiceType, number>> ={
        '2020':{
            'BlurayPackage': 0,
            'Photography': 1700,
            'TwoDayEvent': 0,
            'VideoRecording': 1700,
            'WeddingSession': 600
        },
        '2021':{
            'BlurayPackage': 0,
            'Photography': 1800,
            'TwoDayEvent': 0,
            'VideoRecording': 1800,
            'WeddingSession': 600
        },
        '2022':{
            'BlurayPackage': 0,
            'Photography': 1900,
            'TwoDayEvent': 0,
            'VideoRecording': 1900,
            'WeddingSession': 600
        }
    }
    const discountPairs: Record<ServiceYear, {
        serviceA: ServiceType,
        serviceB: ServiceType,
        discount: number}[]> ={
        '2020': [
            {
                serviceA: 'Photography',
                serviceB: 'WeddingSession',
                discount: 300
            },
            {
                serviceA: 'VideoRecording',
                serviceB: 'Photography',
                discount: 1200
            },
            {
                serviceA: 'VideoRecording',
                serviceB: 'WeddingSession',
                discount: 300
            }
        ],
        '2021': [
            {
                serviceA: 'Photography',
                serviceB: 'WeddingSession',
                discount: 300
            },
            {
                serviceA: 'VideoRecording',
                serviceB: 'Photography',
                discount: 1300
            },
            {
                serviceA: 'VideoRecording',
                serviceB: 'WeddingSession',
                discount: 300
            },
        ],
        '2022': [   {
            serviceA: 'Photography',
            serviceB: 'WeddingSession',
            discount: 600
        },
        
        {
            serviceA: 'VideoRecording',
            serviceB: 'Photography',
            discount: 1300
        },
        {
            serviceA: 'VideoRecording',
            serviceB: 'WeddingSession',
            discount: 300
        },]
    }
 
    const basePriceForYear = basePriceForService[selectedYear]
    const basePrice = selectedServices.map(x=> basePriceForYear[x]).reduce((a,b) => a + b,0)
 
   
    const discountPairsForYear = discountPairs[selectedYear];

    const discount = discountPairsForYear
        .filter(pair => 
            selectedServices.includes(pair.serviceA) && 
            selectedServices.includes(pair.serviceB) &&
            Math.abs(selectedServices.indexOf(pair.serviceA) - selectedServices.indexOf(pair.serviceB)) === 1
            )
        .map(pair => pair.discount)
        .reduce((a,b)=> a+b, 0)


    return { basePrice, finalPrice: basePrice - discount }
}