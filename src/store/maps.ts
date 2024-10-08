import { defineStore, storeToRefs } from 'pinia'
import { useOriginCoords } from './origin'
import { useDestination } from './destination'
import { computed, ref } from 'vue'
import L, { marker } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useRoute } from 'vue-router'
import RealLocationPointIcon from '@/assets/real-location-point.svg'
import '@maptiler/leaflet-maptilersdk'
import { useLoading } from './loading'
import OriginFixedMarkerIcon from '@/assets/origin-fixed-marker.svg'
import DestinationFixedMarkerIcon from '@/assets/destination-fixed-marker.svg'
import { LayerGroup, Map } from 'leaflet'
import { useRoutes } from './routes'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
import { useGeocoding } from './geocoding'
import config from '@/config'

export interface CustomMarker extends L.Marker {
	latLng?: L.LatLng
	_custom_id?: string
}

type MarkerID =
	| 'origin-marker'
	| 'destination-marker'
	| 'origin-marker-fixed'
	| 'destination-marker-fixed'
	| 'real-location-point'

export const useMaps = defineStore('maps-store', () => {
	const geocodingStore = useGeocoding()
	const routesStore = useRoutes()
	const loadingStore = useLoading()
	const sharedMap = ref<L.Map>()
	const originStore = useOriginCoords()
	const markers = ref<CustomMarker[]>([])
	const defaultZoom = ref(16)
	const mapMoving = ref(false)
	const destinationStore = useDestination()
	const route = useRoute()
	const mapLoaded = ref(false)
	const markerVisible = ref(true)
	const isSearching = ref<true | false | null>(null)
	const router = useRouter()
	const isRadarVisible = ref(false)

	const { loading } = storeToRefs(loadingStore)
	const { isRouteInstalled, geoJSONs, distance, duration, price } = storeToRefs(routesStore)
	const { destinationAddress, originAddress } = storeToRefs(geocodingStore)

	const isMarkerAnimating = computed(() => {
		if (loading.value || mapMoving.value) {
			return true
		}

		return false
	})

	const { coords: originCoords, realLat, realLng } = storeToRefs(originStore)
	const { coords: destinationCoords } = storeToRefs(destinationStore)

	async function setMap(payload: L.Map) {
		sharedMap.value = payload
		return
	}

	async function findMarker(type: MarkerID) {
		let marker = markers.value.find(m => m._custom_id === type) as CustomMarker

		return marker
	}

	async function removeMarker(marker: CustomMarker) {
		sharedMap.value?.removeLayer(marker)
		markers.value = markers.value.filter(m => m._custom_id !== marker._custom_id)
		return
	}

	async function addRealLocationPoint() {
		let realLocationPoint = markers.value.find(
			m => m._custom_id === 'real-location-point'
		) as CustomMarker

		if (!realLocationPoint) {
			const realLocationPointIcon = L.icon({
				iconUrl: RealLocationPointIcon,
				iconSize: [16, 16],
			})

			const realLocationPoint = L.marker([realLat.value, realLng.value], {
				icon: realLocationPointIcon,
			}).addTo(sharedMap.value as Map | LayerGroup<any>) as CustomMarker

			realLocationPoint._custom_id = 'real-location-point'
			markers.value.push(realLocationPoint)
		} else {
			realLocationPoint
				.setLatLng([realLat.value, realLng.value])
				.setIcon(L.icon({ iconUrl: RealLocationPointIcon, iconSize: [16, 16] }))
				.addTo(sharedMap.value as Map | LayerGroup<any>)
		}
	}

	async function loadMapDefault(id: string) {
		try {
			// if the function is called inside of this page:
			markerVisible.value = true
			// get origin coords, where user is located
			await Promise.all([originStore.getCoords(), originStore.watchCoords()])

			sharedMap.value = L.map(id, {
				zoomControl: false,
				maxZoom: 20,
			}).setView([originCoords.value.lat, originCoords.value.lng], defaultZoom.value)

			// add layers to the map
			L.tileLayer(config.MAPTILE, {
				maxZoom: 20,
			})
				.addTo(sharedMap.value as Map | LayerGroup<any>)
				.addEventListener('load', async () => {
					if (mapLoaded.value) return
					mapLoaded.value = true
				})

			await addRealLocationPoint()
		} catch (error) {
			alert(JSON.stringify(error))
		}
	}

	async function loadMapInDestinationPage(id: string) {
		try {
			if (route.path !== '/ride/setDestination') return
			markerVisible.value = true

			if (!sharedMap.value) {
				if (destinationCoords.value.lat && destinationCoords.value.lng) {
					sharedMap.value = L.map(id, { zoomControl: false, maxZoom: 20 }).setView(
						[destinationCoords.value.lat, destinationCoords.value.lng],
						defaultZoom.value
					)
				} else {
					sharedMap.value = L.map(id, { zoomControl: false, maxZoom: 20 }).setView(
						[originCoords.value.lat, originCoords.value.lng],
						defaultZoom.value
					)
				}
			} else {
				if (destinationCoords.value.lat && destinationCoords.value.lng) {
					sharedMap.value = L.map(id, { zoomControl: false, maxZoom: 20 }).setView(
						[destinationCoords.value.lat, destinationCoords.value.lng],
						defaultZoom.value
					)
				} else {
					sharedMap.value = L.map(id, { zoomControl: false, maxZoom: 20 }).setView(
						[originCoords.value.lat, originCoords.value.lng],
						defaultZoom.value
					)
				}
			}

			// add layers to the map
			L.tileLayer(config.MAPTILE, {
				maxZoom: 20,
			})
				.addTo(sharedMap.value as Map | LayerGroup<any>)
				.addEventListener('load', async () => {
					if (mapLoaded.value) return
					mapLoaded.value = true
				})

			await addRealLocationPoint()
		} catch (error: any) {
			console.log(error)
			toast(error.message || error || 'Xatolik yuz berdi, dasturni boshqatdan ishga tushiring')
		}
	}

	async function loadMapLetsgoPage(id: string) {
		try {
			if (route.path !== '/ride/letsgo') return

			if (!sharedMap.value) {
				sharedMap.value = L.map(id, { zoomControl: false, maxZoom: 20 }).setView(
					[originCoords.value.lat, originCoords.value.lng],
					defaultZoom.value
				)

				L.tileLayer(config.MAPTILE, {
					maxZoom: 20,
				}).addTo(sharedMap.value as Map | LayerGroup<any>)
			}

			await routesStore.getGeometryOfRoute(
				{
					lat: destinationCoords.value.lat,
					lng: destinationCoords.value.lng,
					name: '',
				},
				{ lat: originCoords.value.lat, lng: originCoords.value.lng, name: '' }
			)
		} catch (error: any) {
			console.log(error)
			toast(error.message || error || 'Xatolik yuz berdi, dasturni boshqatdan ishga tushiring')
		}
	}

	async function initialiseEvents() {
		try {
			// get origin marker
			sharedMap.value?.addEventListener('dragstart', async () => {
				if (isSearching.value) isSearching.value = false
				if (route.path === '/ride/letsgo') return

				mapMoving.value = true
			})

			sharedMap.value?.addEventListener('zoomstart', async e => {
				if (isSearching.value) isSearching.value = false
				if (route.path === '/ride/letsgo') return

				mapMoving.value = true

				return
			})

			sharedMap.value?.addEventListener('zoomend', async e => {
				mapMoving.value = false
				if (typeof isRouteInstalled.value === 'boolean') return
				if (route.path === '/ride/letsgo') return
				if (isSearching.value) return

				isSearching.value = false
				const lat = sharedMap.value?.getCenter().lat as number
				const lng = sharedMap.value?.getCenter().lng as number

				if (route.path === '/ride/setOrigin') {
					await originStore.changeCoords({ lat, lng })

					return
				}

				if (route.path === '/ride/setDestination') {
					await destinationStore.changeCoords({ lat, lng }, 'void')

					return
				}
			})

			sharedMap.value?.addEventListener(
				'dragend',
				async e => {
					setTimeout(async () => {
						mapMoving.value = false
						if (typeof isRouteInstalled.value === 'boolean') return
						if (route.path === '/ride/letsgo') return
						if (isSearching.value) return

						isSearching.value = false
						const lat = sharedMap.value?.getCenter().lat as number
						const lng = sharedMap.value?.getCenter().lng as number

						if (route.path === '/ride/setOrigin') {
							await originStore.changeCoords({ lat, lng })

							return
						}

						if (route.path === '/ride/setDestination') {
							await destinationStore.changeCoords({ lat, lng }, 'void')

							return
						}
					})
				},
				800
			)
		} catch (error) {
			console.log(error)
		}
	}

	async function removeTheGeometryOfRoute(backToDestination: boolean = true) {
		try {
			isRouteInstalled.value = null

			if (!geoJSONs.value) return

			markerVisible.value = true
			price.value = {}
			distance.value = {} as { kmFixed: string; kmFull: string }
			duration.value = {} as {
				full: string
				hours: string
				minutes: string
				seconds: string
			}

			sharedMap.value?.removeLayer(geoJSONs.value as any)
			if (backToDestination) {
				sharedMap.value?.setView(
					[destinationCoords.value.lat, destinationCoords.value.lng],
					defaultZoom.value
				)
			}

			geoJSONs.value = {} as L.LayerGroup

			const originMarkerFixed = await findMarker('origin-marker-fixed')
			const destinationMarkerFixed = await findMarker('destination-marker-fixed')

			if (originMarkerFixed) await removeMarker(originMarkerFixed)
			if (destinationMarkerFixed) await removeMarker(destinationMarkerFixed)

			return
		} catch (error: any) {
			toast.error('Qandaydir xatolik yuzaga keldi', { duration: 4000 })
		}
	}

	async function addFixedMarkers(origin: any, destination: any) {
		const originFixedIcon = L.icon({
			iconUrl: OriginFixedMarkerIcon,
			iconAnchor: [20, 67],
		})

		const originFixedMarker = L.marker([origin.lat, origin.lng], {
			icon: originFixedIcon,
		})
			.on('click', async e => {
				await removeTheGeometryOfRoute(false)
				sharedMap.value?.setView([origin.lat, origin.lng], defaultZoom.value)
				markerVisible.value = true
				await router.push('/ride/setOrigin')
			})
			.addTo(sharedMap.value as Map | LayerGroup<any>) as CustomMarker

		const destinationFixedIcon = L.icon({
			iconUrl: DestinationFixedMarkerIcon,
			iconAnchor: [20, 67],
		})

		const destinationFixedMarker = L.marker([destination.lat, destination.lng], {
			icon: destinationFixedIcon,
		})
			.on('click', async e => {
				await removeTheGeometryOfRoute()
				sharedMap.value?.setView([destination.lat, destination.lng], defaultZoom.value)
				markerVisible.value = true
				await router.push('/ride/setDestination')
			})
			.addTo(sharedMap.value as Map | LayerGroup<any>) as CustomMarker

		originFixedMarker._custom_id = 'origin-marker-fixed'
		destinationFixedMarker._custom_id = 'destination-marker-fixed'

		const existOriginMarker = await findMarker('origin-marker-fixed')
		const existDestinationMarker = await findMarker('destination-marker-fixed')

		if (existOriginMarker) {
			await removeMarker(originFixedMarker)
		}

		if (existDestinationMarker) {
			await removeMarker(destinationFixedMarker)
		}

		markers.value.push(originFixedMarker)
		markers.value.push(destinationFixedMarker)
		return
	}

	async function disableEvents() {
		try {
			sharedMap.value?.dragging.disable()
			sharedMap.value?.boxZoom.disable()
			sharedMap.value?.touchZoom.disable()
			sharedMap.value?.doubleClickZoom.disable()
			sharedMap.value?.scrollWheelZoom.disable()
			return
		} catch (error) {
			toast.error('Error at disabling events')
		}
	}

	async function enableEvents() {
		try {
			sharedMap.value?.dragging.enable()
			sharedMap.value?.boxZoom.enable()
			sharedMap.value?.touchZoom.enable()
			sharedMap.value?.doubleClickZoom.enable()
			sharedMap.value?.scrollWheelZoom.enable()
			return
		} catch (error) {
			toast.error('Error at enabling events')
		}
	}

	async function destroyMap() {
		try {
			if (sharedMap.value) {
				sharedMap.value.off()
				sharedMap.value.remove()

				markers.value = []
				mapLoaded.value = false
				markerVisible.value = false
				geoJSONs.value = undefined as any
			}
		} catch (error) {
			toast('Xatolik yuzaga keldi, dasturni boshqatdan ishga tushiring')
			console.log(error)
		}
	}

	return {
		setMap,
		sharedMap,
		markers,
		defaultZoom,
		mapMoving,
		initialiseEvents,
		mapLoaded,
		findMarker,
		isMarkerAnimating,
		addFixedMarkers,
		markerVisible,
		removeMarker,
		isSearching,
		removeTheGeometryOfRoute,
		isRadarVisible,
		disableEvents,
		enableEvents,
		destroyMap,
		addRealLocationPoint,
		loadMapInDestinationPage,
		loadMapDefault,
		loadMapLetsgoPage,
	}
})
