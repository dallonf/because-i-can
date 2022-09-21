using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using MeanwhileUtils;

[ExecuteAlways]
public class AdaptiveCamera : MonoBehaviour
{
    [AutoRef]
    new Camera camera;

    private void Awake()
    {
        this.SetupAutoRefs();
    }

    // Update is called once per frame
    void Update()
    {
        Vector3 cameraLookDir = transform.forward;

        var lookAtObjects = FindObjectsOfType<AdaptiveCameraTarget>();

        float maxVerticalAngle = 0;
        float maxHorizontalAngle = 0;
        foreach (var lookAtObject in lookAtObjects)
        {
            Vector3 objectPosition = lookAtObject.transform.position;
            Vector3 fromCameraToObject = objectPosition - transform.position;
            float distanceToObject = fromCameraToObject.magnitude;
            Vector3 cameraToObjectDirection = fromCameraToObject / distanceToObject;

            Vector2 zyPlanePosition = new Vector2(
                Vector3.Dot(fromCameraToObject, cameraLookDir),
                Vector3.Dot(fromCameraToObject, transform.up)
            );
            float yAngleToCenter = Vector2.Angle(Vector2.right, zyPlanePosition) * Mathf.Deg2Rad;
            float yAngleOfRadius = Mathf.Asin(lookAtObject.Radius / zyPlanePosition.magnitude);
            float yAngle = yAngleToCenter + yAngleOfRadius;
            if (yAngle > maxVerticalAngle)
            {
                maxVerticalAngle = yAngle;
            }


            Vector2 zxPlanePosition = new Vector2(
                Vector3.Dot(fromCameraToObject, cameraLookDir),
                Vector3.Dot(fromCameraToObject, transform.right)
            );
            float xAngleToCenter = Vector2.Angle(Vector2.right, zxPlanePosition) * Mathf.Deg2Rad;
            float xAngleOfRadius = Mathf.Asin(lookAtObject.Radius / zxPlanePosition.magnitude);
            float xAngle = xAngleToCenter + xAngleOfRadius;
            if (xAngle > maxHorizontalAngle)
            {
                maxHorizontalAngle = xAngle;
            }
        }

        float maxHorizontalAngleAsVertical = Mathf.Atan(Mathf.Tan(maxHorizontalAngle) / camera.aspect);

        float halfFov = Mathf.Max(maxVerticalAngle, maxHorizontalAngleAsVertical);

        camera.fieldOfView = halfFov * 2 * Mathf.Rad2Deg;
    }
}
