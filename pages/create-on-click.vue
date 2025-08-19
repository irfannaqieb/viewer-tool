<template>
	<div>

	</div>
</template>

<script setup>
const mouseX = (event.clientX / window.innerWidth) * 2 - 1
const mouseY = -(event.clientY / window.innerHeight) * 2 + 1
const mouseVector = new THREE.Vector3(mouseX, mouseY, 5)

// convert device coordinates to scene 3d coordinates (project is for the reverse operation)
mouseVector.unproject(camera)

// Calculate the direction from the camera to the mouseVector position
const direction = mouseVector.sub(camera.position).normalize()

// Define a distance to place the indicator away from the camera
const distance = -camera.position.z / direction.z

// Calculate the position of the indicator (direction + distance)
const indicatorPosition = camera.position.clone().add(direction.multiplyScalar(distance))

const indicatorGeometry = new THREE.SphereGeometry(0.01)
const indicatorMaterial = new THREE.MeshBasicMaterial({ color: 0x4287f5 })
const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial)

// Set the position of the indicator
indicator.position.copy(indicatorPosition)

// Add the indicator to the scene
scene.add(indicator)
render()
</script>

<style lang="scss" scoped>

</style>

