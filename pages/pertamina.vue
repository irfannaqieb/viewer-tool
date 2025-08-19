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


	const baseUrl = '/images/pertamina/'
	virtualTour.setNodes([
		{
			id: '1',
			panorama: baseUrl + 'IMG_20250623_091847_00_025.jpg',
			gps: [106.256929, 5.450692, 29 ],
			panoData: { poseHeading: 0 },
			links: [{ nodeId: '2', }],
			// markers: [
			// 	{
			// 		id: 'Pothole 1',
			// 		position: { yaw: '60deg', pitch: '-5deg' },
			// 		image: '/images/warning.png',
			// 		size: { width: 64, height: 64 },
			// 	}
			// ]
		},
		{
			id: '2',
			panorama: baseUrl + 'IMG_20250623_091903_00_026.jpg',
			gps: [106.256933, 5.450692, 29 ],
			panoData: { poseHeading: 0 },
			links: [{ nodeId: '1' }, { nodeId: '3' }],
			
		},
		{
			id: '3',
			panorama: baseUrl + 'IMG_20250623_091925_00_027.jpg',
			gps: [106.256939, 5.450692, 30],
			panoData: { poseHeading: 0 },
			links: [{ nodeId: '2' }, { nodeId: '4' }],
		},
		{
			id: '4',
			panorama: baseUrl + 'IMG_20250624_124442_00_269.jpg',
			gps: [106.256819, 5.450444, 42],
			// panoData: { poseHeading: 35 },
			links: [{ nodeId: '3' }, { nodeId: '5' }],
		},
		{
			id: '5',
			panorama: baseUrl + 'IMG_20250624_124634_00_270.jpg',
			gps: [106.256951, 5.450469, 39],
			// panoData: { poseHeading: 35 },
			sphereCorrection: { pan: '100deg' },
			links: [{ nodeId: '4' }, { nodeId: '6' }],
		}, {
			id: '6',
			panorama: baseUrl + 'IMG_20250624_124645_00_271.jpg',
			gps: [106.256952, 5.450462, 0],
			// panoData: { poseHeading: 35 },
			links: [{ nodeId: '5' }],
		}
	], '1')
	// const markersPlugin = viewer.getPlugin(MarkersPlugin)
	// markersPlugin.addEventListener('select-marker', ({ marker }) => {
	// 	showDetectionDetail.value = !showDetectionDetail.value
	// 	markersPlugin.updateMarker({
	// 		id: marker.id,
	// 		image: '/images/warning.png',
	// 		tooltip: 'Corrosion 1 [Critical]',
	// 	})
	// })

})


</script>

<style lang="scss" scoped></style>