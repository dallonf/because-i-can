using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using MeanwhileUtils;

[ExecuteAlways]
public class AdaptiveCameraDistance : MonoBehaviour
{
    public bool ShouldAdjust;

    [AutoRef]
    new Camera camera;

    private void Awake()
    {
        this.SetupAutoRefs();
    }

    void Update()
    {
        Vector3 cameraLookDir = transform.forward;
        float verticalFov = camera.fieldOfView * Mathf.Deg2Rad;
        float halfVerticalFov = verticalFov / 2;
        float halfHorizontalFov = Mathf.Atan(Mathf.Tan(halfVerticalFov) * camera.aspect);

        var lookAtObjects = FindObjectsOfType<AdaptiveCameraTarget>();

        float requiredZMovement = Mathf.Infinity;
        foreach (var lookAtObject in lookAtObjects)
        {
            Vector3 objectPosition = lookAtObject.transform.position;
            Vector3 fromCameraToObject = objectPosition - transform.position;
            float projectionPlaneDistanceFromCamera = Vector3.Dot(fromCameraToObject, cameraLookDir);

            float objectCoordinateOnZYPlane = Vector3.Dot(fromCameraToObject, transform.up);
            float fitYDistance = (lookAtObject.Radius + (Mathf.Cos(halfVerticalFov) * Mathf.Abs(objectCoordinateOnZYPlane))) / Mathf.Sin(halfVerticalFov);
            float yDistanceChangeRequired = fitYDistance - projectionPlaneDistanceFromCamera;
            if (-yDistanceChangeRequired < requiredZMovement)
            {
                requiredZMovement = -yDistanceChangeRequired;
            }

            float objectCoordinateOnZXPlane = Vector3.Dot(fromCameraToObject, transform.right);
            float fitXDistance = (lookAtObject.Radius + (Mathf.Cos(halfHorizontalFov) * Mathf.Abs(objectCoordinateOnZXPlane))) / Mathf.Sin(halfHorizontalFov);
            float xDistanceChangeRequired = fitXDistance - projectionPlaneDistanceFromCamera;
            if (-xDistanceChangeRequired < requiredZMovement)
            {
                requiredZMovement = -xDistanceChangeRequired;
            }
        }

        if (ShouldAdjust)
        {
            transform.position += transform.forward * requiredZMovement;
        }
        else
        {
            Debug.DrawLine(transform.position, transform.position + transform.forward * requiredZMovement, Color.red);
        }
    }
}

