<template>
	<div class="h-screen w-screen bg-white font-poppins flex flex-col">
		<!-- <span class="text-4xl font-staatliches">ASROW AI</span> -->
		<div class="relative grow ">
			<div ref="viewerContainer" class="bg-black w-full h-full "></div>
			<div class="absolute top-2 right-2 bg-black bg-opacity-60 px-3 py-2">
				<span class="text-white font-bol">SENTRY - Parking B1</span>
			</div>
		</div>
	</div>
</template>

<script setup>
import { Viewer } from '@photo-sphere-viewer/core'
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin'
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin'

import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/markers-plugin/index.css'
import '@photo-sphere-viewer/virtual-tour-plugin/index.css'

const viewerContainer = ref()
const showDetectionDetail = ref(false)
onMounted(() => {
	const viewer = new Viewer({
		container: viewerContainer.value,
		plugins: [
			MarkersPlugin,
			[VirtualTourPlugin, {
				positionMode: 'gps',
				renderMode: '3d',
			}],
		],
	})

	const virtualTour = viewer.getPlugin(VirtualTourPlugin);
	// const marker = {
	// 	id: 'Corrosion 1 [Critical]',
	// 	position: { yaw: '110deg', pitch: '0deg' },
	// 	image: '/images/warning.png',
	// 	size: { width: 64, height: 64 },
	// }


	const baseUrl = '/images/parkings/'
	virtualTour.setNodes([
		{
			id: '1',
			panorama: baseUrl + '1.jpeg',
			gps: [101.73530053590324, 3.1668704123703484, 0],
			panoData: { poseHeading: 276 },
			links: [{ nodeId: '2', }],
			markers: [
				{
					id: 'Pothole 1',
					position: { yaw: '60deg', pitch: '-5deg' },
					image: '/images/warning.png',
					size: { width: 64, height: 64 },
				}
			]
		},
		{
			id: '2',
			panorama: baseUrl + '2.jpeg',
			gps: [101.73544413405143, 3.1668704123703484, 0],
			panoData: { poseHeading: 130 },
			links: [{ nodeId: '1' }, { nodeId: '3' }],
			markers: [
				{
					id: 'Pothole 1',
					position: { yaw: '-12deg', pitch: '-15deg' },
					image: '/images/warning.png',
					size: { width: 64, height: 64 },
				}
			]
		},
		{
			id: '3',
			panorama: baseUrl + '3.jpeg',
			gps: [101.73544165822126, 3.166987422700006, 0],
			panoData: { poseHeading: 10 },
			links: [{ nodeId: '2' }, { nodeId: '4' }],
			markers: [
				{
					id: 'Stalagtite 1',
					position: { yaw: '-74deg', pitch: '-18deg' },
					image: '/images/warning.png',
					size: { width: 64, height: 64 },
				}
			]
		},
		{
			id: '4',
			panorama: baseUrl + '4.jpeg',
			gps: [101.73544083294526, 3.1671308015389075, 0],
			panoData: { poseHeading: 35 },
			links: [{ nodeId: '3' }, { nodeId: '5' }],
			markers: [
				{
					id: 'Stalagtite 1',
					position: { yaw: '-145deg', pitch: '-10deg' },
					image: '/images/warning.png',
					size: { width: 64, height: 64 },
				}
			]
		},
		{
			id: '5',
			panorama: baseUrl + '5.jpeg',
			gps: [101.73543963890009, 3.1676567073224238, 0],
			panoData: { poseHeading: -9 },
			links: [{ nodeId: '4' }, { nodeId: '6' }],
		},
		{
			id: '6',
			panorama: baseUrl + '6.jpeg',
			gps: [101.73530122930606, 3.16766047636225, 0],
			panoData: { poseHeading: -100 },
			links: [{ nodeId: '5' }, { nodeId: '7' }],
		},
		{
			id: '7',
			panorama: baseUrl + '7.jpeg',
			gps: [101.73517162759528, 3.167659220015633, 0],
			panoData: { poseHeading: -80 },
			links: [{ nodeId: '6' }, { nodeId: '8' }],
		},
		{
			id: '8',
			panorama: baseUrl + '8.jpeg',
			gps: [101.73516785278818, 3.167428052214392, 0],
			panoData: { poseHeading: 175 },
			links: [{ nodeId: '7' }, { nodeId: '9' }],
		},
		{
			id: '9',
			panorama: baseUrl + '9.JPG',
			gps: [101.73516659451914, 3.167118990834279, 0],
			panoData: { poseHeading: 230 },
			links: [{ nodeId: '8' }, { nodeId: '10' }],
		},
		{
			id: '10',
			panorama: baseUrl + '10.JPG',
			gps: [101.73516281971204, 3.166877772132038, 0],
			panoData: { poseHeading: -120 },
			links: [{ nodeId: '1' }, { nodeId: '9' }],
		},
	], '1')
	const markersPlugin = viewer.getPlugin(MarkersPlugin)
	markersPlugin.addEventListener('select-marker', ({ marker }) => {
		showDetectionDetail.value = !showDetectionDetail.value
		markersPlugin.updateMarker({
			id: marker.id,
			image: '/images/warning.png',
			tooltip: 'Corrosion 1 [Critical]',
		})
	})

})


</script>

<style lang="scss" scoped></style>