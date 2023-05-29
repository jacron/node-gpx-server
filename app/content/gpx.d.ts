
export interface Link {
    $: {
        href: string
    }
}
export interface Trkseg {
    trkpt: string
}
export interface Trk {
    link: Link[],
    trkseg: Trkseg[],
    name: string,
    type: string,
    desc: string
}
export interface Gpx {
    metadata: Metadata[],
    trk: Trk[],
    $: {
        creator: string
    }
}
export interface Metadata {
    time: string[]
}
export interface Metaresult {
    gpx: Gpx,
    metadata: Metadata[]
}