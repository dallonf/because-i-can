using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class AdaptiveCameraTarget : MonoBehaviour
{
    public float Radius = 1f;

    void OnDrawGizmos()
    {
        Gizmos.color = Color.cyan;
        Gizmos.DrawWireSphere(transform.position, Radius);
    }
}
