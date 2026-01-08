export function useDynamics() {
    const knobPosition = ref(15);
    const knobX = computed(() => { return (knobPosition.value) / 32 * 100 });
    const isKnobBig = ref(false);

    function positionKnob(event) {
        const trackRect = document.querySelector('#track').getBoundingClientRect();
        const trackMouseX = event.clientX - trackRect.left;
        let knobWidth;

        if (isKnobBig.value) {
            knobWidth = trackRect.width == 320 ? 40: 48
        } else {
            knobWidth = trackRect.width == 320 ? 10: 12
        }

        if (trackMouseX < (knobWidth / 2)) {
            knobPosition.value = 0;
        } else {
            let dynamicRange = isKnobBig.value ? 28 : 31;
            if (trackMouseX > trackRect.width - (knobWidth / 2)) {
                knobPosition.value = dynamicRange;
            } else {
                knobPosition.value = Math.round(((trackMouseX - (knobWidth / 2)) / (trackRect.width - knobWidth)) * dynamicRange);
            }
        }
    }

    function stopDragging() {
        window.removeEventListener('mousemove', positionKnob);
        window.removeEventListener('mouseup', stopDragging);
    }

    function startDragging(event) {
        positionKnob(event);
        window.addEventListener('mousemove', positionKnob);
        window.addEventListener('mouseup', stopDragging);
    }

    return {
        knobPosition,
        knobX,
        isKnobBig,
        startDragging
    };
}
