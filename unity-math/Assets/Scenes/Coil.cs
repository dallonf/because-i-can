using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[ExecuteAlways]
public class Coil : MonoBehaviour
{
    public int Revolutions;
    public float Circumference;
    public float Radius;
    /// <summary>
    /// In vertices per revolution
    /// </summary>
    public int Resolution;

    public Color StartColor;
    public Color EndColor;

    private void OnDrawGizmosSelected()
    {
        Vector3 prevVertex = Vector3.zero;
        int vertices = Mathf.CeilToInt(Revolutions * Resolution);
        for (int i = 0; i < vertices; i++)
        {
            float percent = i / ((float)vertices - 1);
            float torusRadius = Circumference / (Mathf.PI * 2);
            float torusAngle = percent * Mathf.PI * 2;
            Vector3 torusDirection = new Vector3(
                Mathf.Cos(torusAngle),
                0,
                Mathf.Sin(torusAngle)
            );
            Vector3 torusPosition = torusDirection * torusRadius;

            float angleTurns = (percent * Revolutions) % 1;
            float angleRad = angleTurns * Mathf.PI * 2;
            Vector3 coilOffset = (-torusDirection * Mathf.Cos(angleRad) * Radius)
                + (Vector3.up * Mathf.Sin(angleRad) * Radius);

            Vector3 newVertex = torusPosition + coilOffset;
            if (i > 0)
            {
                if (percent < 0.5)
                {
                    Gizmos.color = Color.Lerp(StartColor, EndColor, percent / 0.5f);
                }
                else
                {
                    float remaining = Mathf.InverseLerp(0.5f, 1, percent);
                    Gizmos.color = Color.Lerp(EndColor, StartColor, remaining);
                }
                
                Gizmos.DrawLine(prevVertex, newVertex);
            }
            prevVertex = newVertex;
        }
    }
}
